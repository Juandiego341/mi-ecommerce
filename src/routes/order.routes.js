const express = require('express')
const router = express.Router()
const { createOrder, getOrders, getOneOrder } = require('../controllers/order.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

router.post('/', verifyToken, createOrder)
router.get('/', verifyToken, getOrders)
router.get('/:id', verifyToken, getOneOrder)

module.exports = router