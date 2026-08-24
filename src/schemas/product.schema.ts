import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    desc: z.string().min(1, 'La descripcion es requerida'),
    SKU: z.string().min(1, 'Debe tener minimo 3 caracteres'),
    price: z.coerce.number().positive('El precio debe ser positivo'),
    categoryId: z.coerce.number().int().positive('La categoría es requerida'),
    quantity: z.coerce.number().int().min(0,'El stock no puede ser negativo'),
    imagen: z.any().optional()

})

const toTrimmedString = (value: unknown) => {
    if (value === null || value === undefined) return undefined
    return String(value).trim()
}

export const importProductRowSchema = z.object({
    name: z.preprocess(toTrimmedString, z.string().min(1, 'El nombre es requerido')),
    desc: z.preprocess(toTrimmedString, z.string().min(1, 'La descripcion es requerida')),
    SKU: z.preprocess(toTrimmedString, z.string().min(1, 'El SKU es requerido')),
    price: z.coerce.number().positive('El precio debe ser positivo'),
    category: z.preprocess(toTrimmedString, z.string().min(1, 'La categoria es requerida')),
    quantity: z.coerce.number().int().min(0, 'El stock no puede ser negativo')
})