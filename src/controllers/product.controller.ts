import prisma from '../prisma'
import { Request, Response } from 'express'
import { uploadImage } from '../services/cloudinary.service'

interface ProductRequest extends Request {
  file?: Express.Multer.File
}

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

export { getAll, getOne, create, update, remove }
