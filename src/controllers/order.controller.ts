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
        const { provider, idempotencyKey } = req.body

        if (idempotencyKey) {
            const existingOrder = await prisma.orderDetails.findUnique({
                where: { idempotencyKey },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    },
                    payment: true
                }
            })
            if (existingOrder) {
                if (existingOrder.userId !== userId) {
                    res.status(409).json({ message: 'La idempotencyKey ya fue usada por otra orden' })
                    return
                }
                res.status(200).json(existingOrder)
                return
            }
        }

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

        const orderId = await prisma.$transaction(async (tx) => {
            const payment = await tx.paymentDetails.create({
                data: {
                    orderId: 0,
                    amount: Math.round(total),
                    provider,
                    status: 'PENDIENTE'
                }
            })
            const order = await tx.orderDetails.create({
                data: {
                    userId,
                    total,
                    paymentId: payment.id,
                    idempotencyKey: idempotencyKey || undefined
                }
            })

            for (const item of session.cartItems) {
                await tx.orderItems.create({
                    data: {
                        orderId: order.id,
                        productId: item.productId,
                        quantity: item.quantity
                    }
                })

                await tx.productInventory.update({
                    where: { id: item.product.inventoryId },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }

                    }
                })
            }
            await tx.paymentDetails.update({
                where: { id: payment.id },
                data: { orderId: order.id }
            })

            await tx.cartItem.deleteMany({
                where: { sessionId: session.id }
            })

            await tx.shoppingSession.delete({
                where: { id: session.id }
            })

            return order.id
        })

        const orderComplete = await prisma.orderDetails.findFirst({
            where: { id: orderId },
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
        if (error.code === 'P2002' && req.body.idempotencyKey) {
            const existingOrder = await prisma.orderDetails.findUnique({
                where: { idempotencyKey: req.body.idempotencyKey },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    },
                    payment: true
                }
            })
            if (existingOrder) {
                res.status(200).json(existingOrder)
                return
            }
        }
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

        if (order.userId !== req.user!.id && req.user!.rol !== 'ADMIN') {
            res.status(404).json({ message: 'Orden no encontrada' })
            return
        }

        res.json(order)
    }
    catch (error : any) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const { status } = req.body

        const order = await prisma.orderDetails.findUnique({
            where: { id: parseInt(id as string) }
        })
        if (!order) {
            res.status(404).json({ message: 'Orden no encontrada' })
            return
        }

        await prisma.paymentDetails.update({
            where: { id: order.paymentId },
            data: { status }
        })

        if (status === 'PAGADO' && order.status === 'PENDIENTE') {
            await prisma.orderDetails.update({
                where: { id: order.id },
                data: { status: 'PAGADO' }
            })
        }

        const updatedOrder = await prisma.orderDetails.findUnique({
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

        res.json(updatedOrder)
    }
    catch (error : any) {
        res.status(500).json({ message: 'Error al actualizar el estado de la orden', error: error.message })
    }
}

const FULFILLMENT_STAGE_ORDER = ['PENDIENTE', 'PAGADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO']

const updateOrderFulfillment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const { status } = req.body

        const order = await prisma.orderDetails.findUnique({
            where: { id: parseInt(id as string) }
        })
        if (!order) {
            res.status(404).json({ message: 'Orden no encontrada' })
            return
        }

        if (status === 'CANCELADO') {
            if (['ENVIADO', 'ENTREGADO', 'CANCELADO'].includes(order.status)) {
                res.status(400).json({ message: 'No se puede cancelar un pedido ya enviado, entregado o cancelado' })
                return
            }
        } else {
            const currentIndex = FULFILLMENT_STAGE_ORDER.indexOf(order.status)
            const targetIndex = FULFILLMENT_STAGE_ORDER.indexOf(status)
            if (currentIndex === -1 || targetIndex !== currentIndex + 1) {
                res.status(400).json({ message: 'El pedido debe avanzar una etapa a la vez, en orden' })
                return
            }
        }

        const updatedOrder = await prisma.orderDetails.update({
            where: { id: order.id },
            data: { status },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            }
        })

        res.json(updatedOrder)
    }
    catch (error : any) {
        res.status(500).json({ message: 'Error al actualizar el estado del pedido', error: error.message })
    }
}

const getAllOrdersAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await prisma.orderDetails.findMany({
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        res.json(orders)
    }
    catch (error : any) {
        res.status(500).json({ message: 'Error al obtener las ordenes', error: error.message })
    }
}

export  { createOrder, getOrders, getOneOrder, updateOrderStatus, updateOrderFulfillment, getAllOrdersAdmin }