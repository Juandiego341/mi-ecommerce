import { z } from "zod";

export const updateOrderStatusSchema = z.object({
    status: z.enum(['PENDIENTE', 'PAGADO', 'FALLIDO'])
});

export const updateOrderFulfillmentSchema = z.object({
    status: z.enum(['PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'])
});
