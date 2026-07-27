const prisma = require('../prisma')

const getAll = async (req, res) => {
    try {
        const category = await prisma.productCategory.findMany()
        res.json(category)
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
}

const getOne = async (req, res) => {
    try {
        const { id } = req.params

        const category = await prisma.productCategory.findUnique({
            where: { id: parseInt(id) }
        })

        if (!category) {
            return res.status(404).json({ message: "Categoria no encontrada" })
        }

        res.json(category);
    }
    catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
}

const create = async (req, res) => {
    try {
        const { name, desc } = req.body

        const category = await prisma.productCategory.create({
            data: { name, desc }
        })

        res.status(201).json(category)
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params
        const { name, desc } = req.body

        const category = await prisma.productCategory.update({
            where: { id: parseInt(id) },
            data: { name, desc }
        })
        res.json(category)
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

const remove = async (req, res) => {
    try {
        const { id } = req.params

        await prisma.productCategory.delete({
            where: {
                id: parseInt(id)
            }
        })
        res.json({ message: 'Categoria eliminada correctamente' })
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }

}
module.exports = { getAll, getOne, create, update, remove }