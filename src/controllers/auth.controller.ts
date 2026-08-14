import bcrypt  from 'bcrypt'
import jwt  from 'jsonwebtoken'
import prisma  from '../prisma'
import logger  from '../utils/logger'
import { Request, Response } from 'express'


const register = async (req:Request , res: Response):Promise<void> => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        
        logger.info(`Intento de registro para email: ${email}`);

        const userExists = await prisma.user.findUnique({
            where: { email }
        });

        if (userExists) {
            logger.warn(`Email ya registrado: ${email}`);
             res.status(400).json({ 
                code: 'EMAIL_ALREADY_EXISTS',
                message: 'El email ya está registrado' 
            });
            return
        }
        
        const passwordEncrypted = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: passwordEncrypted,
                firstName,
                lastName,
            }
        });
        
        logger.info(`Usuario registrado exitosamente: ${user.id}`);
        
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            usuario: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error: any) {
        logger.error(`Error en registro: ${error.message}`, { 
            stack: error.stack,
            email: req.body.email 
        });
        res.status(500).json({ 
            code: 'REGISTER_ERROR',
            message: 'Error al crear el usuario' 
        });
    }
};


const login = async (req:Request , res: Response):Promise<void>  => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
             res.status(400).json({ 
                code: 'VALIDATION_ERROR',
                message: 'Email y contraseña son requeridos' 
            })
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
             res.status(400).json({ 
                code: 'INVALID_EMAIL',
                message: 'Email inválido' 
            })
            return
        }

        const usuario = await prisma.user.findUnique({
            where: { email }
        })
        
        if (!usuario) {
            res.status(401).json({ 
                code: 'INVALID_CREDENTIALS',
                message: 'Credenciales incorrectas' 
            })
            return
        }

        const passwordValida = await bcrypt.compare(password, usuario.password)

        if (!passwordValida) {
             res.status(401).json({ 
                code: 'INVALID_CREDENTIALS',
                message: 'Credenciales incorrectas' 
            })
            return
        }


        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        )

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
        })
    } catch (error: any) {
        res.status(500).json({ 
            code: 'LOGIN_ERROR',
            message: 'Error al iniciar sesión', 
            error: error.message 
        })
    }
}

export  { register, login }
