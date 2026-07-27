const prisma = require('../prisma')

const getAll = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                inventory: true,
                discount: true
            }
        })
        res.json(products)
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const getOne = async (req, res) => {
    try {
        const { id } = req.params

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true,
                inventory: true,
                discount: true
            }
        })

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' })
        }

        res.json(product)
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const create = async (req, res) => {
    try {
        const { name, desc, SKU, price, categoryId, quantity } = req.body

        // Primero crear el inventario
        const inventory = await prisma.productInventory.create({
            data: { quantity }
        })

        // Luego crear el producto con el inventario asociado
        const product = await prisma.product.create({
            data: {
                name,
                desc,
                SKU,
                price,
                categoryId: parseInt(categoryId),
                inventoryId: inventory.id
            }
        })

        res.status(201).json(product)
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params
        const { name, desc, SKU, price, categoryId } = req.body

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: { name, desc, SKU, price, categoryId: parseInt(categoryId) }
        })

        res.json(product)
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const remove = async (req, res) => {
    try {
        const { id } = req.params

        // Primero obtener el producto para saber el inventoryId
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        })

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' })
        }

        // Eliminar el producto
        await prisma.product.delete({
            where: { id: parseInt(id) }
        })

        // Luego eliminar el inventario asociado
        await prisma.productInventory.delete({
            where: { id: product.inventoryId }
        })

        res.json({ message: 'Producto eliminado correctamente' })
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

module.exports = { getAll, getOne, create, update, remove }