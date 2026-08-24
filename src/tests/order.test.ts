import request from 'supertest'
import app from '../app'
import prisma from '../prisma'
import { resetDb, createUser, authToken, createProductFixture } from './helpers/testUtils'

let token: string
let adminToken: string
let userId: number
let productId: number

beforeEach(async () => {
  await resetDb()
  const user = await createUser()
  userId = user.id
  token = authToken(user)
  const admin = await createUser({ email: 'admin@example.com', username: 'admin', rol: 'ADMIN' })
  adminToken = authToken(admin)
  const product = await createProductFixture({ price: 50, quantity: 10 })
  productId = product.id

  await request(app)
    .post('/cart/items')
    .set('Authorization', `Bearer ${token}`)
    .send({ productId, quantity: 3 })
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /order', () => {
  it('rechaza crear una orden con el carrito vacio', async () => {
    await prisma.cartItem.deleteMany()

    const res = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 0 })

    expect(res.status).toBe(400)
  })

  it('crea la orden a partir del carrito, descuenta inventario y vacia el carrito', async () => {
    const res = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150 })

    expect(res.status).toBe(201)
    expect(res.body.total).toBe(150)
    expect(res.body.items).toHaveLength(1)
    expect(res.body.payment.provider).toBe('test-provider')

    const inventory = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true }
    })
    expect(inventory!.inventory.quantity).toBe(7)

    const session = await prisma.shoppingSession.findFirst({ where: { userId } })
    expect(session).toBeNull()
  })

  it('ignora el amount enviado por el cliente y cobra el total real del carrito', async () => {
    const res = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 1 })

    expect(res.status).toBe(201)
    expect(res.body.total).toBe(150)
    expect(res.body.payment.amount).toBe(150)
  })

  it('con la misma idempotencyKey devuelve la misma orden sin duplicar el cobro', async () => {
    const first = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150, idempotencyKey: 'checkout-abc123' })

    expect(first.status).toBe(201)

    const second = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150, idempotencyKey: 'checkout-abc123' })

    expect(second.status).toBe(200)
    expect(second.body.id).toBe(first.body.id)

    const orders = await prisma.orderDetails.findMany({ where: { userId } })
    expect(orders).toHaveLength(1)

    const inventory = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true }
    })
    expect(inventory!.inventory.quantity).toBe(7)
  })
})

describe('GET /order', () => {
  it('lista las ordenes del usuario autenticado', async () => {
    await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150 })

    const res = await request(app).get('/order').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })
})

describe('GET /order/:id', () => {
  it('devuelve 404 si la orden no existe', async () => {
    const res = await request(app).get('/order/999999').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it('devuelve la orden por id', async () => {
    const createRes = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150 })

    const res = await request(app)
      .get(`/order/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(createRes.body.id)
  })

  it('no permite ver la orden de otro usuario', async () => {
    const createRes = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150 })

    const otherUser = await createUser({ email: 'otro@example.com', username: 'otro' })
    const otherToken = authToken(otherUser)

    const res = await request(app)
      .get(`/order/${createRes.body.id}`)
      .set('Authorization', `Bearer ${otherToken}`)

    expect(res.status).toBe(404)
  })

  it('permite a un admin ver la orden de cualquier usuario', async () => {
    const createRes = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150 })

    const res = await request(app)
      .get(`/order/${createRes.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
  })
})

describe('PATCH /order/:id/status', () => {
  it('rechaza si el usuario no es admin', async () => {
    const createRes = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150 })

    const res = await request(app)
      .patch(`/order/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'PAGADO' })

    expect(res.status).toBe(403)
  })

  it('actualiza el estado del pago con token de admin', async () => {
    const createRes = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150 })

    const res = await request(app)
      .patch(`/order/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PAGADO' })

    expect(res.status).toBe(200)
    expect(res.body.payment.status).toBe('PAGADO')
    expect(res.body.status).toBe('PAGADO')
  })

  it('rechaza un estado no permitido', async () => {
    const createRes = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150 })

    const res = await request(app)
      .patch(`/order/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ESTADO_INVENTADO' })

    expect(res.status).toBe(400)
  })
})

describe('PATCH /order/:id/fulfillment', () => {
  const createPaidOrder = async () => {
    const createRes = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150 })

    await request(app)
      .patch(`/order/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PAGADO' })

    return createRes.body.id
  }

  it('rechaza si el usuario no es admin', async () => {
    const orderId = await createPaidOrder()

    const res = await request(app)
      .patch(`/order/${orderId}/fulfillment`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'PREPARANDO' })

    expect(res.status).toBe(403)
  })

  it('avanza las etapas en orden: preparando, enviado, entregado', async () => {
    const orderId = await createPaidOrder()

    const preparando = await request(app)
      .patch(`/order/${orderId}/fulfillment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PREPARANDO' })
    expect(preparando.status).toBe(200)
    expect(preparando.body.status).toBe('PREPARANDO')

    const enviado = await request(app)
      .patch(`/order/${orderId}/fulfillment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ENVIADO' })
    expect(enviado.status).toBe(200)
    expect(enviado.body.status).toBe('ENVIADO')

    const entregado = await request(app)
      .patch(`/order/${orderId}/fulfillment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ENTREGADO' })
    expect(entregado.status).toBe(200)
    expect(entregado.body.status).toBe('ENTREGADO')
  })

  it('rechaza saltarse una etapa (de pagado directo a enviado)', async () => {
    const orderId = await createPaidOrder()

    const res = await request(app)
      .patch(`/order/${orderId}/fulfillment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ENVIADO' })

    expect(res.status).toBe(400)
  })

  it('rechaza avanzar si el pago aun no esta confirmado', async () => {
    const createRes = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150 })

    const res = await request(app)
      .patch(`/order/${createRes.body.id}/fulfillment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PREPARANDO' })

    expect(res.status).toBe(400)
  })

  it('permite cancelar un pedido antes de enviarlo', async () => {
    const orderId = await createPaidOrder()

    const res = await request(app)
      .patch(`/order/${orderId}/fulfillment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CANCELADO' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('CANCELADO')
  })

  it('no permite cancelar un pedido ya enviado', async () => {
    const orderId = await createPaidOrder()

    await request(app)
      .patch(`/order/${orderId}/fulfillment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PREPARANDO' })

    await request(app)
      .patch(`/order/${orderId}/fulfillment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ENVIADO' })

    const res = await request(app)
      .patch(`/order/${orderId}/fulfillment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CANCELADO' })

    expect(res.status).toBe(400)
  })
})

describe('GET /order/admin', () => {
  it('rechaza si el usuario no es admin', async () => {
    const res = await request(app).get('/order/admin').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('devuelve las ordenes de todos los usuarios', async () => {
    await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'test-provider', amount: 150 })

    const res = await request(app).get('/order/admin').set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].user.email).toBeDefined()
  })
})
