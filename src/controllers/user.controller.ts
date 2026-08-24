import prisma  from '../prisma'
import { Request, Response } from 'express'

interface AuthRequest extends Request{
    user?:{
        id:number
        email: string
        rol: string
    }
}
const getProfile = async (req:AuthRequest , res: Response):Promise<void> => {
    try {
        console.log('req.user:', req.user)
        const userId = req.user!.id
        console.log('userId:', userId)

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
            }
        })
        res.status(200).json({ message: "usuario obtenido exitosamente", user })

    } catch (error: any) {
        res.status(500).json({ message: 'Error en el servidor ', error: error.message })
    }

}

const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id

        const { username, firstName, lastName, email } = req.body

        const user = await prisma.user.update({
            where: { id: userId },
            data: { username, firstName, lastName, email },
            select: {
                username: true,
                email: true,
                firstName: true,
                lastName: true
            }
        })

        res.status(200).json({ message: "el usuario fue acutalizado con exito", user })
    } catch (error: any) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }

}

const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id

        const address = await prisma.userAddress.findMany({
            where: { userId }
        })

        res.status(200).json({ message: 'Direcciones obtenidas exitosamente', address })
    }
    catch (error: any) {
        res.status(500).json({ message: 'Error en el servidor ', error: error.message })
    }
}

const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id
        const { addressLine1, addressLine2, city, postalCode, country, telephone, mobile } = req.body

        const address = await prisma.userAddress.create({

            data: {
                userId,
                addressLine1,
                addressLine2,
                city,
                postalCode,
                country,
                telephone,
                mobile
            }
        })
        res.status(201).json({ message: "La direccion fue creada con exito", address })

    } catch (error: any) {
        res.status(500).json({
            message: "Error en el servidor", error: error.message
        })
    }
}

const updateAddress = async (req:AuthRequest, res:Response):Promise<void> => {
    try {
        const userId = req.user!.id
        const { id } = req.params
        const { addressLine1, addressLine2, city, postalCode, country, telephone, mobile } = req.body

        const result = await prisma.userAddress.updateMany({
            where: { id: parseInt(id as string), userId },
            data: {
                addressLine1,
                addressLine2,
                city,
                postalCode,
                country,
                telephone,
                mobile
            }
        })

        if (result.count === 0) {
            res.status(404).json({ message: 'Direccion no encontrada' })
            return
        }

        const address = await prisma.userAddress.findUnique({ where: { id: parseInt(id as string) } })
        res.status(200).json({ message: "Direccion cambiada con exito", address })
    } catch (error: any) {
        res.status(500).json({
            message: "Error en el servidor", error: error.message
        })
    }
}

const deleteAddress = async (req:AuthRequest, res:Response):Promise<void> => {
    try {
        const userId = req.user!.id
        const { id } = req.params

        const result = await prisma.userAddress.deleteMany({
            where: { id: parseInt(id as string), userId }
        })

        if (result.count === 0) {
            res.status(404).json({ message: 'Direccion no encontrada' })
            return
        }

        res.json({ message: "La direccion fue eliminada correctamente" })
    } catch (error: any) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}
export { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress }