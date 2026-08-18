"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getOne = exports.getAll = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getAll = async (req, res) => {
    try {
        const category = await prisma_1.default.productCategory.findMany();
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};
exports.getAll = getAll;
const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma_1.default.productCategory.findUnique({
            where: { id: parseInt(id) }
        });
        if (!category) {
            res.status(404).json({ message: "Categoria no encontrada" });
            return;
        }
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};
exports.getOne = getOne;
const create = async (req, res) => {
    try {
        const { name, desc } = req.body;
        const category = await prisma_1.default.productCategory.create({
            data: { name, desc }
        });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, desc } = req.body;
        const category = await prisma_1.default.productCategory.update({
            where: { id: parseInt(id) },
            data: { name, desc }
        });
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.productCategory.delete({
            where: {
                id: parseInt(id)
            }
        });
        res.json({ message: 'Categoria eliminada correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
exports.remove = remove;
