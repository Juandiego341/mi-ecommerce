import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { Request, Response } from 'express'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

import authRoutes from'./routes/auth.routes'
import categoryRoutes from'./routes/category.routes'
import productRoutes from './routes/product.routes'
import cartRoutes from './routes/cart.routes'
import orderRoutes from'./routes/order.routes'
import userRoutes from'./routes/user.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/category', categoryRoutes)
app.use('/product', productRoutes)
app.use('/cart', cartRoutes)
app.use('/order', orderRoutes)
app.use('/user', userRoutes)

const PORT = process.env.PORT || 3000
app.get('/', (req:Request, res:Response) => {
    res.json({ message: '🚀 API ecommerce funcionando' })
})

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})