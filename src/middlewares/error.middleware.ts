import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error.message)

  // Error de Prisma - registro no encontrado
  if (error.code === 'P2025') {
    res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Registro no encontrado'
    })
    return
  }

  // Error de Prisma - violación de unique
  if (error.code === 'P2002') {
    res.status(400).json({
      code: 'DUPLICATE_ERROR',
      message: 'Ya existe un registro con esos datos'
    })
    return
  }

  // Error genérico
  res.status(error.status || 500).json({
    code: 'SERVER_ERROR',
    message: error.message || 'Error interno del servidor'
  })
}