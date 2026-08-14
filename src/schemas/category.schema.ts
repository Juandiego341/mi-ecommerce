import { z } from "zod";


export const createCategorySchema =z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    desc: z.string().min(1,'La descripcion debe contener minimo 3 palabras')

})