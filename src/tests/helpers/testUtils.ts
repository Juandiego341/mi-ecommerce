import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ExcelJS from 'exceljs'
import prisma from '../../prisma'

export const resetDb = async (): Promise<void> => {
  await prisma.orderItems.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.orderDetails.deleteMany()
  await prisma.paymentDetails.deleteMany()
  await prisma.shoppingSession.deleteMany()
  await prisma.product.deleteMany()
  await prisma.productInventory.deleteMany()
  await prisma.discount.deleteMany()
  await prisma.productCategory.deleteMany()
  await prisma.userAddress.deleteMany()
  await prisma.userPayment.deleteMany()
  await prisma.user.deleteMany()
}

export const createUser = async (overrides: Partial<{
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  rol: 'CLIENTE' | 'ADMIN'
}> = {}) => {
  const password = await bcrypt.hash(overrides.password ?? 'Password123', 10)
  return prisma.user.create({
    data: {
      username: overrides.username ?? 'testuser',
      email: overrides.email ?? 'test@example.com',
      password,
      firstName: overrides.firstName ?? 'Test',
      lastName: overrides.lastName ?? 'User',
      rol: overrides.rol ?? 'CLIENTE'
    }
  })
}

export const authToken = (user: { id: number; email: string; rol: string }): string => {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  )
}

export const createProductFixture = async (overrides: Partial<{ price: number; quantity: number }> = {}) => {
  const category = await prisma.productCategory.create({
    data: { name: 'Categoria Test', desc: 'Descripcion de categoria de test' }
  })
  const inventory = await prisma.productInventory.create({
    data: { quantity: overrides.quantity ?? 10 }
  })
  const product = await prisma.product.create({
    data: {
      name: 'Producto Test',
      desc: 'Descripcion de producto de test',
      SKU: `SKU-TEST-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      price: overrides.price ?? 100,
      categoryId: category.id,
      inventoryId: inventory.id
    }
  })
  return product
}

type ImportRow = {
  Nombre?: string
  Descripcion?: string
  SKU?: string
  Precio?: number
  Categoria?: string
  Stock?: number
}

export const buildProductImportExcel = async (
  rows: ImportRow[],
  headers: string[] = ['Nombre', 'Descripcion', 'SKU', 'Precio', 'Categoria', 'Stock']
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Productos')
  sheet.addRow(headers)
  rows.forEach((row) => {
    sheet.addRow([row.Nombre, row.Descripcion, row.SKU, row.Precio, row.Categoria, row.Stock])
  })
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
