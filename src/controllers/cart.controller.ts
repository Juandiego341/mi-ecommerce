import prisma  from '../prisma'
import { Request, Response } from 'express'

interface AuthRequest extends Request{
    user?:{
        id:number
        email: string
        rol: string
    }
}


const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id

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
             res.json({ cartItems: [], total: 0 })
             return

        }
        res.json(session)
    } catch (error: any) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const addItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id
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
             res.json(updateItem)
             return
        }

        const newItem = await prisma.cartItem.create({
            data: {
                sessionId: session.id,
                productId: parseInt(productId),
                quantity: parseInt(quantity)
            }
        })
        res.status(201).json(newItem)
    } catch (error: any) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const updateItem = async (req:Request, res:Response):Promise<void> => {
    try {
        const { id } = req.params
        const { quantity } = req.body

        const item = await prisma.cartItem.update({
            where: { id: parseInt(id as string) },
            data: { quantity: parseInt(quantity) }
        })

        res.json(item)
    }
    catch (error: any) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const removeItem = async (req:Request, res:Response):Promise<void> => {
    try {
        const { id } = req.params

        await prisma.cartItem.delete({
            where: { id: parseInt(id as string) }
        })
        res.json({ message: 'Item eliminado del carrito' })
    }
    catch (error: any) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const clearCart = async (req:AuthRequest, res:Response):Promise<void> => {
    try {
        const userId = req.user!.id

        const session = await prisma.shoppingSession.findFirst({
            where: { userId }
        })
        if (!session) {
             res.status(404).json({ message: 'Carrito no encontrado' })
             return
        }
        await prisma.cartItem.deleteMany({
            where: { sessionId: session.id }
        })
        res.json({ message: 'Carrito vaciado correctamente' })
    }
    catch (error: any) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

export { getCart, addItem, updateItem, removeItem, clearCart }
