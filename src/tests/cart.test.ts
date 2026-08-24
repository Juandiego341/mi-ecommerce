import request from 'supertest'
import app from '../app'
import prisma from '../prisma'
import { resetDb, createUser, authToken, createProductFixture } from './helpers/testUtils'

let token: string
let productId: number

beforeEach(async () => {
  await resetDb()
  const user = await createUser()
  token = authToken(user)
  const product = await createProductFixture()
  productId = product.id
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('GET /cart', () => {
  it('rechaza sin token', async () => {
    const res = await request(app).get('/cart')
    expect(res.status).toBe(401)
  })

  it('rechaza con un token invalido', async () => {
    const res = await request(app).get('/cart').set('Authorization', 'Bearer token-invalido')
    expect(res.status).toBe(401)
  })

  it('devuelve carrito vacio si no hay sesion', async () => {
    const res = await request(app).get('/cart').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ cartItems: [], total: 0 })
  })
})

describe('POST /cart/items', () => {
  it('agrega un producto nuevo al carrito', async () => {
    const res = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 })

    expect(res.status).toBe(201)
    expect(res.body.productId).toBe(productId)
    expect(res.body.quantity).toBe(2)
  })

  it('suma la cantidad si el producto ya estaba en el carrito', async () => {
    await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 })

    const res = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 3 })

    expect(res.status).toBe(200)
    expect(res.body.quantity).toBe(5)
  })
})

describe('PUT /cart/items/:id', () => {
  it('actualiza la cantidad de un item', async () => {
    const addRes = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 })

    const res = await request(app)
      .put(`/cart/items/${addRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 7 })

    expect(res.status).toBe(200)
    expect(res.body.quantity).toBe(7)
  })
})

describe('DELETE /cart/items/:id', () => {
  it('elimina un item del carrito', async () => {
    const addRes = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 })

    const res = await request(app)
      .delete(`/cart/items/${addRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    const item = await prisma.cartItem.findUnique({ where: { id: addRes.body.id } })
    expect(item).toBeNull()
  })
})

describe('DELETE /cart', () => {
  it('vacia el carrito completo', async () => {
    await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 })

    const res = await request(app).delete('/cart').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)

    const cart = await request(app).get('/cart').set('Authorization', `Bearer ${token}`)
    expect(cart.body.cartItems).toEqual([])
  })
})
