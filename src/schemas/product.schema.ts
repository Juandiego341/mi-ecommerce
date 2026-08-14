import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    desc: z.string().min(1, 'La descripcion es requerida'),
    SKU: z.string().min(1, 'Debe tener minimo 3 caracteres'),
    price: z.number().positive('El precio debe ser postivo'),
    categoryId: z.number().positive('La categoria es requerida'),
    quantity: z.number().int().min(0,'El stock no puede ser negativo'),
    
})