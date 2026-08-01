import express  from 'express'
import { getCart, addItem, updateItem, removeItem, clearCart } from '../controllers/cart.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = express.Router()

router.get('/', verifyToken, getCart)
router.post('/items', verifyToken, addItem)
router.put('/items/:id', verifyToken, updateItem)
router.delete('/items/:id', verifyToken, removeItem)
router.delete('/', verifyToken, clearCart)

export default router