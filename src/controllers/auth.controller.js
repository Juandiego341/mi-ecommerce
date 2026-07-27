const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')
const logger = require('../utils/logger')

const register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        
        logger.info(`Intento de registro para email: ${email}`);

        const userExists = await prisma.user.findUnique({
            where: { email }
        });

        if (userExists) {
            logger.warn(`Email ya registrado: ${email}`);
            return res.status(400).json({ 
                code: 'EMAIL_ALREADY_EXISTS',
                message: 'El email ya está registrado' 
            });
        }
        
        const passwordEncrypted = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: passwordEncrypted,
                firstName,
                lastName
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
    } catch (error) {
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


const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ 
                code: 'VALIDATION_ERROR',
                message: 'Email y contraseña son requeridos' 
            })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                code: 'INVALID_EMAIL',
                message: 'Email inválido' 
            })
        }

        const usuario = await prisma.user.findUnique({
            where: { email }
        })

        if (!usuario) {
            return res.status(401).json({ 
                code: 'INVALID_CREDENTIALS',
                message: 'Credenciales incorrectas' 
            })
        }

        const passwordValida = await bcrypt.compare(password, usuario.password)

        if (!passwordValida) {
            return res.status(401).json({ 
                code: 'INVALID_CREDENTIALS',
                message: 'Credenciales incorrectas' 
            })
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
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
    } catch (error) {
        res.status(500).json({ 
            code: 'LOGIN_ERROR',
            message: 'Error al iniciar sesión', 
            error: error.message 
        })
    }
}

module.exports = { register, login }
