import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'

interface AuthRequest extends Request{
    user?:{
        id:number
        email: string
        rol: string
    }
}


const verifyToken = (req: AuthRequest, res:Response, next:NextFunction): void => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) {
         res.status(401).json({ message: 'Acceso denegado, token requerido' })
         return
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET as string) as  { id: number, email: string, rol: string }
        req.user = user
        next()
    } catch (error: any) {
         res.status(404).json({ message: ' Token invalido o expirado ' })
         return

    }
}
export { verifyToken }
