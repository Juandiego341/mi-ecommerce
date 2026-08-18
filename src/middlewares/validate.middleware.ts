import { Request, Response, NextFunction } from 'express'
import { ZodType, ZodError } from 'zod'

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    
    console.log('Body en validate:', req.body)
    console.log('File en validate:', req.file)
    try {
      schema.parse(req.body)
      next()
    } catch (error: any) {
      
  console.log('Error de validación:', JSON.stringify(error.issues, null, 2))
      if (error instanceof ZodError) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Datos inválidos',
          errors: error.issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        })
      } else {
        res.status(500).json({
          code: 'SERVER_ERROR',
          message: 'Error en el servidor'
        })
      }
    }
  }
}