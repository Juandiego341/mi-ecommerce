"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getOne = exports.getAll = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const cloudinary_service_1 = require("../services/cloudinary.service");
const getAll = async (req, res) => {
    try {
        const products = await prisma_1.default.product.findMany({
            include: {
                category: true,
                inventory: true,
                discount: true
            }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.getAll = getAll;
const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma_1.default.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true,
                inventory: true,
                discount: true
            }
        });
        if (!product) {
            res.status(404).json({ message: 'Producto no encontrado' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.getOne = getOne;
const create = async (req, res) => {
    try {
        console.log('Llegó al controller create');
        console.log('Body:', req.body);
        console.log('File:', req.file);
        const { name, desc, SKU, price, categoryId, quantity } = req.body;
        let imageUrl = null;
        if (req.file) {
            imageUrl = await (0, cloudinary_service_1.uploadImage)(req.file.buffer, 'productos');
        }
        const inventory = await prisma_1.default.productInventory.create({
            data: { quantity: parseInt(quantity) }
        });
        const product = await prisma_1.default.product.create({
            data: {
                name,
                desc,
                SKU,
                price: parseFloat(price),
                categoryId: parseInt(categoryId),
                inventoryId: inventory.id,
                imagen: imageUrl
            }
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, desc, SKU, price, categoryId } = req.body;
        const productoActual = await prisma_1.default.product.findUnique({
            where: { id: parseInt(id) }
        });
        if (!productoActual) {
            res.status(404).json({ message: 'Producto no encontrado' });
            return;
        }
        let imageUrl = productoActual.imagen;
        if (req.file) {
            imageUrl = await (0, cloudinary_service_1.uploadImage)(req.file.buffer, 'productos');
        }
        const product = await prisma_1.default.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                desc,
                SKU,
                price: parseFloat(price),
                categoryId: parseInt(categoryId),
                imagen: imageUrl
            }
        });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma_1.default.product.findUnique({
            where: { id: parseInt(id) }
        });
        if (!product) {
            res.status(404).json({ message: 'Producto no encontrado' });
            return;
        }
        await prisma_1.default.product.delete({
            where: { id: parseInt(id) }
        });
        await prisma_1.default.productInventory.delete({
            where: { id: product.inventoryId }
        });
        res.json({ message: 'Producto eliminado correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.remove = remove;
