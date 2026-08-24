import request from 'supertest'
import app from '../app'
import prisma from '../prisma'
import { resetDb, createUser } from './helpers/testUtils'

beforeEach(async () => {
  await resetDb()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /auth/register', () => {
  it('crea un usuario nuevo y devuelve 201', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'nuevo',
      email: 'nuevo@example.com',
      password: 'Password123',
      firstName: 'Nuevo',
      lastName: 'Usuario'
    })

    expect(res.status).toBe(201)
    expect(res.body.usuario.email).toBe('nuevo@example.com')

    const userInDb = await prisma.user.findUnique({ where: { email: 'nuevo@example.com' } })
    expect(userInDb).not.toBeNull()
    expect(userInDb!.password).not.toBe('Password123')
  })

  it('rechaza el registro si el email ya existe', async () => {
    await createUser({ email: 'repetido@example.com' })

    const res = await request(app).post('/auth/register').send({
      username: 'otro',
      email: 'repetido@example.com',
      password: 'Password123',
      firstName: 'Otro',
      lastName: 'Usuario'
    })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('EMAIL_ALREADY_EXISTS')
  })

  it('rechaza datos invalidos con 400', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'x',
      email: 'no-es-un-email',
      password: '123',
      firstName: '',
      lastName: ''
    })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})

describe('POST /auth/login', () => {
  it('inicia sesion con credenciales correctas y devuelve token', async () => {
    await createUser({ email: 'login@example.com', password: 'Password123' })

    const res = await request(app).post('/auth/login').send({
      email: 'login@example.com',
      password: 'Password123'
    })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('login@example.com')
  })

  it('rechaza con password incorrecto', async () => {
    await createUser({ email: 'login2@example.com', password: 'Password123' })

    const res = await request(app).post('/auth/login').send({
      email: 'login2@example.com',
      password: 'incorrecta'
    })

    expect(res.status).toBe(401)
    expect(res.body.code).toBe('INVALID_CREDENTIALS')
  })

  it('rechaza si el usuario no existe', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'no-existe@example.com',
      password: 'Password123'
    })

    expect(res.status).toBe(401)
    expect(res.body.code).toBe('INVALID_CREDENTIALS')
  })

  it('rechaza un email con formato invalido', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'no-es-un-email',
      password: 'Password123'
    })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})
