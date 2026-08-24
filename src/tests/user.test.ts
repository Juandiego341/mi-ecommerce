import request from 'supertest'
import app from '../app'
import prisma from '../prisma'
import { resetDb, createUser, authToken } from './helpers/testUtils'

let userA: Awaited<ReturnType<typeof createUser>>
let userB: Awaited<ReturnType<typeof createUser>>
let tokenA: string
let tokenB: string

beforeEach(async () => {
  await resetDb()
  userA = await createUser({ email: 'usera@example.com', username: 'usera' })
  userB = await createUser({ email: 'userb@example.com', username: 'userb' })
  tokenA = authToken(userA)
  tokenB = authToken(userB)
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('GET /user/profile', () => {
  it('rechaza sin token', async () => {
    const res = await request(app).get('/user/profile')
    expect(res.status).toBe(401)
  })

  it('devuelve el perfil del usuario autenticado', async () => {
    const res = await request(app).get('/user/profile').set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('usera@example.com')
  })
})

describe('PUT /user/profile', () => {
  it('actualiza el perfil del usuario autenticado', async () => {
    const res = await request(app)
      .put('/user/profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ username: 'usera', firstName: 'Nombre', lastName: 'Apellido', email: 'usera@example.com' })

    expect(res.status).toBe(200)
    expect(res.body.user.firstName).toBe('Nombre')
  })
})

describe('direcciones de usuario', () => {
  const addressPayload = {
    addressLine1: 'Calle 1',
    addressLine2: '',
    city: 'Bogota',
    postalCode: '110111',
    country: 'CO',
    telephone: '6011234567',
    mobile: '3001234567'
  }

  it('crea y lista direcciones del propio usuario', async () => {
    const createRes = await request(app)
      .post('/user/address')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(addressPayload)

    expect(createRes.status).toBe(201)

    const listRes = await request(app).get('/user/address').set('Authorization', `Bearer ${tokenA}`)
    expect(listRes.status).toBe(200)
    expect(listRes.body.address).toHaveLength(1)
  })

  it('no permite editar la direccion de otro usuario', async () => {
    const createRes = await request(app)
      .post('/user/address')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(addressPayload)

    const res = await request(app)
      .put(`/user/address/${createRes.body.address.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ ...addressPayload, city: 'Medellin' })

    expect(res.status).toBe(404)

    const address = await prisma.userAddress.findUnique({ where: { id: createRes.body.address.id } })
    expect(address!.city).toBe('Bogota')
  })

  it('no permite borrar la direccion de otro usuario', async () => {
    const createRes = await request(app)
      .post('/user/address')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(addressPayload)

    const res = await request(app)
      .delete(`/user/address/${createRes.body.address.id}`)
      .set('Authorization', `Bearer ${tokenB}`)

    expect(res.status).toBe(404)

    const address = await prisma.userAddress.findUnique({ where: { id: createRes.body.address.id } })
    expect(address).not.toBeNull()
  })

  it('permite al dueño editar y borrar su propia direccion', async () => {
    const createRes = await request(app)
      .post('/user/address')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(addressPayload)

    const updateRes = await request(app)
      .put(`/user/address/${createRes.body.address.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ ...addressPayload, city: 'Medellin' })

    expect(updateRes.status).toBe(200)
    expect(updateRes.body.address.city).toBe('Medellin')

    const deleteRes = await request(app)
      .delete(`/user/address/${createRes.body.address.id}`)
      .set('Authorization', `Bearer ${tokenA}`)

    expect(deleteRes.status).toBe(200)

    const address = await prisma.userAddress.findUnique({ where: { id: createRes.body.address.id } })
    expect(address).toBeNull()
  })
})
