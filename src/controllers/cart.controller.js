const prisma = require('../prisma')


const getCart = async (req, res) => {
    try {
        const userId = req.user.id

        const session = await prisma.shoppingSession.findFirst({
            where: { userId },
            include: {
                cartItems: {
                    include: {
                        product: true
                    }
                }
            }
        })

        if (!session) {
            return res.json({ items: [], total: 0 })

        }
        res.json(session)
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const addItem = async (req, res) => {
    try {
        const userId = req.user.id
        const { productId, quantity } = req.body

        let session = await prisma.shoppingSession.findFirst({
            where: { userId }
        })
        if (!session) {
            session = await prisma.shoppingSession.create({
                data: { userId, total: 0 }
            })
        }
        const itemExist = await prisma.cartItem.findFirst({
            where: {
                sessionId: session.id,
                productId: parseInt(productId)
            }
        })
        if (itemExist) {

            const updateItem = await prisma.cartItem.update({
                where: { id: itemExist.id },
                data: { quantity: itemExist.quantity + quantity }
            })
            return res.json(updateItem)
        }

        const newItem = await prisma.cartItem.create({
            data: {
                sessionId: session.id,
                productId: parseInt(productId),
                quantity: parseInt(quantity)
            }
        })
        res.status(201).json(newItem)
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const updateItem = async (req, res) => {
    try {
        const { id } = req.params
        const { quantity } = req.body

        const item = await prisma.cartItem.update({
            where: { id: parseInt(id) },
            data: { quantity: parseInt(quantity) }
        })

        res.json(item)
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const removeItem = async (req, res) => {
    try {
        const { id } = req.params

        await prisma.cartItem.delete({
            where: { id: parseInt(id) }
        })
        res.json({ message: 'Item eliminado del carrito' })
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const clearCart = async (req, res) => {
    try {
        const userId = req.user.id

        const session = await prisma.shoppingSession.findFirst({
            where: { userId }
        })
        if (!session) {
            return res.status(404).json({ message: 'Carrito no encontrado' })
        }
        await prisma.cartItem.deleteMany({
            where: { sessionId: session.id }
        })
        res.json({ message: 'Carrito vaciado correctamente' })
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart }
