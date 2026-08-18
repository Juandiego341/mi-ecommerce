"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Limite general de la applicacion es de 100 peticiones o si no podra reintentarlo en 15 minutos ( Por el momento )
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Demasiadas peticiones, intenta de nuevo en 15 minutos'
    }
});
//Limite de 10 peticiones por ip o si no se podra reintentar en 15 minutos (Por el momento)
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Demasiados intentos, intenta de nuevo en 15 minutos'
    }
});
