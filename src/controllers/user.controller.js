const prisma = require('../prisma')

const getProfile = async (req, res) => {
    try {
        console.log('req.user:', req.user)
        const userId = req.user.id
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

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor ', error: error.message })
    }

}

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id

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
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }

}

const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id

        const address = await prisma.userAddress.findMany({
            where: { userId }
        })

        res.status(200).json({ message: 'Direcciones obtenidas exitosamente', address })
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor ', error: error.message })
    }
}

const addAddress = async (req, res) => {
    try {
        const userId = req.user.id
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

    } catch (error) {
        res.status(500).json({
            message: "Error en el servidor", error: error.message
        })
    }
}

const updateAddress = async (req, res) => {
    try {
        const { id } = req.params
        const { addressLine1, addressLine2, city, postalCode, country, telephone, mobile } = req.body

        const address = await prisma.userAddress.update({
            where: { id: parseInt(id) },
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
        res.status(200).json({ message: "Direccion cambiada con exito", address })
    } catch (error) {
        res.status(500).json({
            message: "Error en el servidor", error: error.message
        })
    }
}

const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params
        await prisma.userAddress.delete({
            where: { id: parseInt(id) }
        })

        res.json({ message: "La direccion fue eliminada correctamente" })
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}
module.exports = { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress }