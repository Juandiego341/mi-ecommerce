"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error('Error:', error.message);
    // Error de Prisma - registro no encontrado
    if (error.code === 'P2025') {
        res.status(404).json({
            code: 'NOT_FOUND',
            message: 'Registro no encontrado'
        });
        return;
    }
    // Error de Prisma - violación de unique
    if (error.code === 'P2002') {
        res.status(400).json({
            code: 'DUPLICATE_ERROR',
            message: 'Ya existe un registro con esos datos'
        });
        return;
    }
    // Error genérico
    res.status(error.status || 500).json({
        code: 'SERVER_ERROR',
        message: error.message || 'Error interno del servidor'
    });
};
exports.errorHandler = errorHandler;
