"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
const register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        logger_1.default.info(`Intento de registro para email: ${email}`);
        const userExists = await prisma_1.default.user.findUnique({
            where: { email }
        });
        if (userExists) {
            logger_1.default.warn(`Email ya registrado: ${email}`);
            res.status(400).json({
                code: 'EMAIL_ALREADY_EXISTS',
                message: 'El email ya está registrado'
            });
            return;
        }
        const passwordEncrypted = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                username,
                email,
                password: passwordEncrypted,
                firstName,
                lastName,
            }
        });
        logger_1.default.info(`Usuario registrado exitosamente: ${user.id}`);
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            usuario: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (error) {
        logger_1.default.error(`Error en registro: ${error.message}`, {
            stack: error.stack,
            email: req.body.email
        });
        res.status(500).json({
            code: 'REGISTER_ERROR',
            message: 'Error al crear el usuario'
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                code: 'VALIDATION_ERROR',
                message: 'Email y contraseña son requeridos'
            });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                code: 'INVALID_EMAIL',
                message: 'Email inválido'
            });
            return;
        }
        const usuario = await prisma_1.default.user.findUnique({
            where: { email }
        });
        if (!usuario) {
            res.status(401).json({
                code: 'INVALID_CREDENTIALS',
                message: 'Credenciales incorrectas'
            });
            return;
        }
        const passwordValida = await bcrypt_1.default.compare(password, usuario.password);
        if (!passwordValida) {
            res.status(401).json({
                code: 'INVALID_CREDENTIALS',
                message: 'Credenciales incorrectas'
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: usuario.id, email: usuario.email, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            code: 'LOGIN_SUCCESS',
            message: 'Login exitoso',
            token,
            user: {
                id: usuario.id,
                username: usuario.username,
                email: usuario.email,
                firstName: usuario.firstName,
                lastName: usuario.lastName,
                rol: usuario.rol
            }
        });
    }
    catch (error) {
        res.status(500).json({
            code: 'LOGIN_ERROR',
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};
exports.login = login;
