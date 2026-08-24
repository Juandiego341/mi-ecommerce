import prisma from '../prisma'
import { Request, Response } from 'express'
import ExcelJS from 'exceljs'
import { uploadImage } from '../services/cloudinary.service'
import { importProductRowSchema } from '../schemas/product.schema'

interface ProductRequest extends Request {
  file?: Express.Multer.File
}

const IMPORT_HEADER_MAP: Record<string, string> = {
  nombre: 'name',
  descripcion: 'desc',
  sku: 'SKU',
  precio: 'price',
  categoria: 'category',
  stock: 'quantity'
}

const normalizeHeader = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        inventory: true,
        discount: true
      }
    })
    res.json(products)
  } catch (error: any) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const getOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        category: true,
        inventory: true,
        discount: true
      }
    })

    if (!product) {
      res.status(404).json({ message: 'Producto no encontrado' })
      return
    }

    res.json(product)
  } catch (error: any) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const create = async (req: ProductRequest, res: Response): Promise<void> => {
  try {
    console.log('Llegó al controller create')
    console.log('Body:', req.body)
    console.log('File:', req.file)

    const { name, desc, SKU, price, categoryId, quantity } = req.body

    let imageUrl = null
    if (req.file) {
      imageUrl = await uploadImage(req.file.buffer, 'productos')
    }

    const inventory = await prisma.productInventory.create({
      data: { quantity: parseInt(quantity) }
    })

    const product = await prisma.product.create({
      data: {
        name,
        desc,
        SKU,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        inventoryId: inventory.id,
        imagen: imageUrl
      }
    })

    res.status(201).json(product)
  } catch (error: any) {
    console.log('Error en create:', error.message)
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const update = async (req: ProductRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, desc, SKU, price, categoryId } = req.body

    const productoActual = await prisma.product.findUnique({
      where: { id: parseInt(id as string) }
    })

    if (!productoActual) {
      res.status(404).json({ message: 'Producto no encontrado' })
      return
    }

    let imageUrl = productoActual.imagen

    if (req.file) {
      imageUrl = await uploadImage(req.file.buffer, 'productos')
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id as string) },
      data: {
        name,
        desc,
        SKU,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        imagen: imageUrl
      }
    })

    res.json(product)
  } catch (error: any) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id as string) }
    })

    if (!product) {
      res.status(404).json({ message: 'Producto no encontrado' })
      return
    }

    await prisma.product.delete({
      where: { id: parseInt(id as string) }
    })

    await prisma.productInventory.delete({
      where: { id: product.inventoryId }
    })

    res.json({ message: 'Producto eliminado correctamente' })
  } catch (error: any) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

interface ImportResult {
  created: number
  updated: number
  errors: { row: number; message: string }[]
}

const importProducts = async (req: ProductRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Debes subir un archivo Excel (.xlsx)' })
      return
    }

    const workbook = new ExcelJS.Workbook()
    try {
      await workbook.xlsx.load(req.file.buffer as unknown as ExcelJS.Buffer)
    } catch {
      res.status(400).json({ message: 'El archivo Excel está corrupto o no es válido' })
      return
    }

    const sheet = workbook.worksheets[0]
    if (!sheet) {
      res.status(400).json({ message: 'El archivo no tiene hojas' })
      return
    }

    const columnMap: Record<number, string> = {}
    sheet.getRow(1).eachCell((cell, colNumber) => {
      const field = IMPORT_HEADER_MAP[normalizeHeader(cell.value)]
      if (field) columnMap[colNumber] = field
    })

    const missingColumns = Object.values(IMPORT_HEADER_MAP).filter(
      (field) => !Object.values(columnMap).includes(field)
    )
    if (missingColumns.length > 0) {
      res.status(400).json({
        message: `Faltan columnas requeridas en el Excel: ${missingColumns.join(', ')}`
      })
      return
    }

    const result: ImportResult = { created: 0, updated: 0, errors: [] }

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber)
      if (row.actualCellCount === 0) continue

      const rawData: Record<string, unknown> = {}
      row.eachCell((cell, colNumber) => {
        const field = columnMap[colNumber]
        if (field) rawData[field] = cell.value
      })
      if (Object.keys(rawData).length === 0) continue

      const parsed = importProductRowSchema.safeParse(rawData)
      if (!parsed.success) {
        result.errors.push({
          row: rowNumber,
          message: parsed.error.issues.map((issue) => issue.message).join(', ')
        })
        continue
      }

      const { name, desc, SKU, price, category, quantity } = parsed.data

      try {
        let productCategory = await prisma.productCategory.findFirst({
          where: { name: { equals: category, mode: 'insensitive' } }
        })
        if (!productCategory) {
          productCategory = await prisma.productCategory.create({
            data: { name: category, desc: category }
          })
        }

        const existingProduct = await prisma.product.findUnique({ where: { SKU } })

        if (existingProduct) {
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: { name, desc, price, categoryId: productCategory.id }
          })
          await prisma.productInventory.update({
            where: { id: existingProduct.inventoryId },
            data: { quantity }
          })
          result.updated++
        } else {
          const inventory = await prisma.productInventory.create({ data: { quantity } })
          await prisma.product.create({
            data: {
              name,
              desc,
              SKU,
              price,
              categoryId: productCategory.id,
              inventoryId: inventory.id
            }
          })
          result.created++
        }
      } catch (rowError: any) {
        result.errors.push({ row: rowNumber, message: rowError.message })
      }
    }

    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: 'Error al importar el archivo', error: error.message })
  }
}

export { getAll, getOne, create, update, remove, importProducts }
