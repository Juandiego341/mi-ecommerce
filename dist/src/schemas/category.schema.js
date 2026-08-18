"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'El nombre es requerido'),
    desc: zod_1.z.string().min(1, 'La descripcion debe contener minimo 3 palabras')
});
