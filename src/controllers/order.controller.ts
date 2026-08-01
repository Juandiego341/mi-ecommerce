import prisma from '../prisma'
import { Request, Response } from 'express'

interface AuthRequest extends Request{
    user?:{
        id:number
        email: string
        rol: string
    }
}
const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id
        const { provider, amount } = req.body

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
        if (!session || session.cartItems.length === 0) {
             res.status(400).json({ message: 'El carrito esta vacio' })
             return
        }

        const total = session.cartItems.reduce((acc, item) => {
            return acc + item.product.price * item.quantity
        }, 0)

        const payment = await prisma.paymentDetails.create({
            data: {
                orderId: 0,
                amount,
                provider,
                status: 'PENDIENTE'
            }
        })
        const order = await prisma.orderDetails.create({
            data: {
                userId,
                total,
                paymentId: payment.id
            }
        })

        for (const item of session.cartItems) {
            await prisma.orderItems.create({
                data: {
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity
                }
            })

            await prisma.productInventory.update({
                where: { id: item.product.inventoryId },
                data: {
                    quantity: {
                        decrement: item.quantity
                    }

                }
            })
        }
        await prisma.paymentDetails.update({
            where: { id: payment.id },
            data: { orderId: order.id }
        })

        await prisma.cartItem.deleteMany({
            where: { sessionId: session.id }
        })

        await prisma.shoppingSession.delete({
            where: { id: session.id }
        })

        const orderComplete = await prisma.orderDetails.findFirst({
            where: { id: order.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            }
        })
        res.status(201).json(orderComplete)
    }
    catch (error : any) {
        res.status(500).json({ message: 'Error al crear la orden', error: error.message })
    }
}

const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id

        const orders = await prisma.orderDetails.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            }
        })
        res.json(orders)
    }
    catch (error : any) {
        res.status(500).json({ message: 'Error al obtener las ordenes', error: error.message })
    }
}

const getOneOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params

        const order = await prisma.orderDetails.findUnique({
            where: { id: parseInt(id as string) },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            }
        })
        if (!order) {
            res.status(404).json({ message: 'Orden no encontrada' })
            return
        }

        res.json(order)
    }
    catch (error : any) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}
export  { createOrder, getOrders, getOneOrder }