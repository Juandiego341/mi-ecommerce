import request from 'supertest'
import app from '../app'
import prisma from '../prisma'
import { resetDb, createUser, authToken } from './helpers/testUtils'

let adminToken: string
let clienteToken: string

beforeEach(async () => {
  await resetDb()
  const admin = await createUser({ email: 'admin@example.com', username: 'admin', rol: 'ADMIN' })
  const cliente = await createUser({ email: 'cliente@example.com', username: 'cliente', rol: 'CLIENTE' })
  adminToken = authToken(admin)
  clienteToken = authToken(cliente)
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('GET /category', () => {
  it('devuelve lista vacia si no hay categorias', async () => {
    const res = await request(app).get('/category')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /category', () => {
  it('rechaza sin token', async () => {
    const res = await request(app).post('/category').send({ name: 'Ropa', desc: 'Ropa y accesorios' })
    expect(res.status).toBe(401)
  })

  it('rechaza si el usuario no es admin', async () => {
    const res = await request(app)
      .post('/category')
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ name: 'Ropa', desc: 'Ropa y accesorios' })

    expect(res.status).toBe(403)
  })

  it('crea una categoria con token de admin', async () => {
    const res = await request(app)
      .post('/category')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Ropa', desc: 'Ropa y accesorios' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Ropa')
  })

  it('rechaza datos invalidos', async () => {
    const res = await request(app)
      .post('/category')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '', desc: '' })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})

describe('GET /category/:id', () => {
  it('devuelve 404 si no existe', async () => {
    const res = await request(app).get('/category/999999')
    expect(res.status).toBe(404)
  })
})

describe('PUT /category/:id', () => {
  it('actualiza una categoria existente', async () => {
    const createRes = await request(app)
      .post('/category')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Ropa', desc: 'Ropa y accesorios' })

    const res = await request(app)
      .put(`/category/${createRes.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Calzado', desc: 'Zapatos y tenis' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Calzado')
  })
})

describe('DELETE /category/:id', () => {
  it('elimina una categoria existente', async () => {
    const createRes = await request(app)
      .post('/category')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Ropa', desc: 'Ropa y accesorios' })

    const res = await request(app)
      .delete(`/category/${createRes.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)

    const category = await prisma.productCategory.findUnique({ where: { id: createRes.body.id } })
    expect(category).toBeNull()
  })
})
