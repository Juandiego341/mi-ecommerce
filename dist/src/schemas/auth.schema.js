"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "El usuario debe tener por lo menos 3 caracteres"),
    email: zod_1.z.email("Email invalido"),
    password: zod_1.z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    firstName: zod_1.z.string().min(1, "El nombre es requerido"),
    lastName: zod_1.z.string().min(1, "El apellido es requerido "),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email("Email invalido"),
    password: zod_1.z.string().min(1, "La contraseña es requerida"),
});
