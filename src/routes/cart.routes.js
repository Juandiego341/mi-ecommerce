const express = require('express')
const router = express.Router()
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cart.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

router.get('/', verifyToken, getCart)
router.post('/items', verifyToken, addItem)
router.put('/items/:id', verifyToken, updateItem)
router.delete('/items/:id', verifyToken, removeItem)
router.delete('/', verifyToken, clearCart)

module.exports = router