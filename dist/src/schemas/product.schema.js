"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'El nombre es requerido'),
    desc: zod_1.z.string().min(1, 'La descripcion es requerida'),
    SKU: zod_1.z.string().min(1, 'Debe tener minimo 3 caracteres'),
    price: zod_1.z.coerce.number().positive('El precio debe ser positivo'),
    categoryId: zod_1.z.coerce.number().int().positive('La categoría es requerida'),
    quantity: zod_1.z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
    imagen: zod_1.z.any().optional()
});
