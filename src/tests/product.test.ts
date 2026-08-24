import request from 'supertest'
import app from '../app'
import prisma from '../prisma'
import { resetDb, createUser, authToken, createProductFixture, buildProductImportExcel } from './helpers/testUtils'

let adminToken: string
let clienteToken: string
let categoryId: number

beforeEach(async () => {
  await resetDb()
  const admin = await createUser({ email: 'admin@example.com', username: 'admin', rol: 'ADMIN' })
  const cliente = await createUser({ email: 'cliente@example.com', username: 'cliente', rol: 'CLIENTE' })
  adminToken = authToken(admin)
  clienteToken = authToken(cliente)
  const category = await prisma.productCategory.create({
    data: { name: 'Categoria Test', desc: 'Descripcion de categoria de test' }
  })
  categoryId = category.id
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('GET /product', () => {
  it('devuelve lista vacia si no hay productos', async () => {
    const res = await request(app).get('/product')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('devuelve los productos existentes', async () => {
    await createProductFixture()

    const res = await request(app).get('/product')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })
})

describe('GET /product/:id', () => {
  it('devuelve 404 si no existe', async () => {
    const res = await request(app).get('/product/999999')
    expect(res.status).toBe(404)
  })

  it('devuelve el producto por id', async () => {
    const product = await createProductFixture()

    const res = await request(app).get(`/product/${product.id}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(product.id)
  })
})

describe('POST /product', () => {
  it('rechaza sin token', async () => {
    const res = await request(app).post('/product').send({
      name: 'Nuevo producto',
      desc: 'Descripcion',
      SKU: 'SKU-NEW-1',
      price: 100,
      categoryId,
      quantity: 5
    })

    expect(res.status).toBe(401)
  })

  it('rechaza si el usuario no es admin', async () => {
    const res = await request(app)
      .post('/product')
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({
        name: 'Nuevo producto',
        desc: 'Descripcion',
        SKU: 'SKU-NEW-1',
        price: 100,
        categoryId,
        quantity: 5
      })

    expect(res.status).toBe(403)
  })

  it('crea un producto con token de admin', async () => {
    const res = await request(app)
      .post('/product')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Nuevo producto',
        desc: 'Descripcion',
        SKU: 'SKU-NEW-1',
        price: 100,
        categoryId,
        quantity: 5
      })

    expect(res.status).toBe(201)
    expect(res.body.SKU).toBe('SKU-NEW-1')
  })

  it('rechaza datos invalidos', async () => {
    const res = await request(app)
      .post('/product')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '',
        desc: '',
        SKU: '',
        price: -10,
        categoryId: 0,
        quantity: -1
      })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})

describe('POST /product/import', () => {
  it('rechaza sin token', async () => {
    const buffer = await buildProductImportExcel([])
    const res = await request(app)
      .post('/product/import')
      .attach('file', buffer, 'productos.xlsx')

    expect(res.status).toBe(401)
  })

  it('rechaza si el usuario no es admin', async () => {
    const buffer = await buildProductImportExcel([])
    const res = await request(app)
      .post('/product/import')
      .set('Authorization', `Bearer ${clienteToken}`)
      .attach('file', buffer, 'productos.xlsx')

    expect(res.status).toBe(403)
  })

  it('crea productos nuevos y crea la categoria si no existe', async () => {
    const buffer = await buildProductImportExcel([
      { Nombre: 'Camiseta', Descripcion: 'Camiseta de algodon', SKU: 'SKU-IMP-1', Precio: 25, Categoria: 'Ropa Nueva', Stock: 10 }
    ])

    const res = await request(app)
      .post('/product/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', buffer, 'productos.xlsx')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ created: 1, updated: 0, errors: [] })

    const product = await prisma.product.findUnique({
      where: { SKU: 'SKU-IMP-1' },
      include: { category: true, inventory: true }
    })
    expect(product?.category.name).toBe('Ropa Nueva')
    expect(product?.inventory.quantity).toBe(10)
  })

  it('actualiza un producto existente si el SKU ya existe', async () => {
    const existing = await createProductFixture({ price: 50, quantity: 5 })

    const buffer = await buildProductImportExcel([
      { Nombre: 'Nombre actualizado', Descripcion: 'Desc actualizada', SKU: existing.SKU, Precio: 99, Categoria: 'Categoria Test', Stock: 40 }
    ])

    const res = await request(app)
      .post('/product/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', buffer, 'productos.xlsx')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ created: 0, updated: 1, errors: [] })

    const updated = await prisma.product.findUnique({
      where: { id: existing.id },
      include: { inventory: true }
    })
    expect(updated?.name).toBe('Nombre actualizado')
    expect(updated?.price).toBe(99)
    expect(updated?.inventory.quantity).toBe(40)
  })

  it('reporta filas invalidas sin bloquear las validas', async () => {
    const buffer = await buildProductImportExcel([
      { Nombre: 'Producto valido', Descripcion: 'Desc', SKU: 'SKU-IMP-OK', Precio: 10, Categoria: 'Ropa', Stock: 5 },
      { Nombre: '', Descripcion: 'Desc', SKU: 'SKU-IMP-BAD', Precio: -5, Categoria: 'Ropa', Stock: -1 }
    ])

    const res = await request(app)
      .post('/product/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', buffer, 'productos.xlsx')

    expect(res.status).toBe(200)
    expect(res.body.created).toBe(1)
    expect(res.body.errors).toHaveLength(1)
    expect(res.body.errors[0].row).toBe(3)
  })

  it('rechaza el archivo si faltan columnas requeridas', async () => {
    const buffer = await buildProductImportExcel(
      [{ Nombre: 'X' }],
      ['Nombre']
    )

    const res = await request(app)
      .post('/product/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', buffer, 'productos.xlsx')

    expect(res.status).toBe(400)
  })
})

describe('DELETE /product/:id', () => {
  it('elimina un producto existente', async () => {
    const product = await createProductFixture()

    const res = await request(app)
      .delete(`/product/${product.id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)

    const found = await prisma.product.findUnique({ where: { id: product.id } })
    expect(found).toBeNull()
  })
})
