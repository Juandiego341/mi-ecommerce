import prisma  from '../prisma'
import { Request, Response } from 'express'


const getAll = async (req:Request , res: Response):Promise<void>  => {
    try {
        const category = await prisma.productCategory.findMany()
        res.json(category)
    } catch (error: any) {
        res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
}

const getOne = async (req:Request , res: Response):Promise<void>  => {
    try {
        const { id } = req.params

        const category = await prisma.productCategory.findUnique({
            where: { id: parseInt(id as string) }
        })

        if (!category) {
            res.status(404).json({ message: "Categoria no encontrada" })
            return
        }

        res.json(category);
    }
    catch (error: any) {
        res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
}

const create = async (req:Request , res: Response):Promise<void>  => {
    try {
        const { name, desc } = req.body

        const category = await prisma.productCategory.create({
            data: { name, desc }
        })

        res.status(201).json(category)
    } catch (error: any) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const update = async (req:Request , res: Response):Promise<void>  => {
    try {
        const { id } = req.params
        const { name, desc } = req.body

        const category = await prisma.productCategory.update({
            where: { id: parseInt(id as string) },
            data: { name, desc }
        })
        res.json(category)
    }
    catch (error: any) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const remove = async (req:Request , res: Response):Promise<void>  => {
    try {
        const { id } = req.params

        await prisma.productCategory.delete({
            where: {
                id: parseInt(id as string)
            }
        })
        res.json({ message: 'Categoria eliminada correctamente' })
    } catch (error: any) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }

}
export { getAll, getOne, create, update, remove }