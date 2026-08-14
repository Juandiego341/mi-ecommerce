import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(1, "El usuario debe tener por lo menos 3 caracteres"),
    email: z.email("Email invalido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido "),
});

export const loginSchema = z.object({
    email: z.email("Email invalido"),
    password: z.string().min(1, "La contraseña es requerida"),
});
