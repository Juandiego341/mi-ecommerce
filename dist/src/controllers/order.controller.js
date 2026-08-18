"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOneOrder = exports.getOrders = exports.createOrder = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { provider, amount } = req.body;
        const session = await prisma_1.default.shoppingSession.findFirst({
            where: { userId },
            include: {
                cartItems: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!session || session.cartItems.length === 0) {
            res.status(400).json({ message: 'El carrito esta vacio' });
            return;
        }
        const total = session.cartItems.reduce((acc, item) => {
            return acc + item.product.price * item.quantity;
        }, 0);
        const payment = await prisma_1.default.paymentDetails.create({
            data: {
                orderId: 0,
                amount,
                provider,
                status: 'PENDIENTE'
            }
        });
        const order = await prisma_1.default.orderDetails.create({
            data: {
                userId,
                total,
                paymentId: payment.id
            }
        });
        for (const item of session.cartItems) {
            await prisma_1.default.orderItems.create({
                data: {
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity
                }
            });
            await prisma_1.default.productInventory.update({
                where: { id: item.product.inventoryId },
                data: {
                    quantity: {
                        decrement: item.quantity
                    }
                }
            });
        }
        await prisma_1.default.paymentDetails.update({
            where: { id: payment.id },
            data: { orderId: order.id }
        });
        await prisma_1.default.cartItem.deleteMany({
            where: { sessionId: session.id }
        });
        await prisma_1.default.shoppingSession.delete({
            where: { id: session.id }
        });
        const orderComplete = await prisma_1.default.orderDetails.findFirst({
            where: { id: order.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            }
        });
        res.status(201).json(orderComplete);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al crear la orden', error: error.message });
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma_1.default.orderDetails.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener las ordenes', error: error.message });
    }
};
exports.getOrders = getOrders;
const getOneOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma_1.default.orderDetails.findUnique({
            where: { id: parseInt(id) },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            }
        });
        if (!order) {
            res.status(404).json({ message: 'Orden no encontrada' });
            return;
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.getOneOrder = getOneOrder;
