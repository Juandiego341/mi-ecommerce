"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeItem = exports.updateItem = exports.addItem = exports.getCart = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
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
        if (!session) {
            res.json({ items: [], total: 0 });
            return;
        }
        res.json(session);
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.getCart = getCart;
const addItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;
        let session = await prisma_1.default.shoppingSession.findFirst({
            where: { userId }
        });
        if (!session) {
            session = await prisma_1.default.shoppingSession.create({
                data: { userId, total: 0 }
            });
        }
        const itemExist = await prisma_1.default.cartItem.findFirst({
            where: {
                sessionId: session.id,
                productId: parseInt(productId)
            }
        });
        if (itemExist) {
            const updateItem = await prisma_1.default.cartItem.update({
                where: { id: itemExist.id },
                data: { quantity: itemExist.quantity + quantity }
            });
            res.json(updateItem);
            return;
        }
        const newItem = await prisma_1.default.cartItem.create({
            data: {
                sessionId: session.id,
                productId: parseInt(productId),
                quantity: parseInt(quantity)
            }
        });
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.addItem = addItem;
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const item = await prisma_1.default.cartItem.update({
            where: { id: parseInt(id) },
            data: { quantity: parseInt(quantity) }
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.updateItem = updateItem;
const removeItem = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.cartItem.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Item eliminado del carrito' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.removeItem = removeItem;
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const session = await prisma_1.default.shoppingSession.findFirst({
            where: { userId }
        });
        if (!session) {
            res.status(404).json({ message: 'Carrito no encontrado' });
            return;
        }
        await prisma_1.default.cartItem.deleteMany({
            where: { sessionId: session.id }
        });
        res.json({ message: 'Carrito vaciado correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.clearCart = clearCart;
