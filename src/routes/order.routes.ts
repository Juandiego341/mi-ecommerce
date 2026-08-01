import express from 'express' 
import { createOrder, getOrders, getOneOrder } from '../controllers/order.controller'
import { verifyToken } from'../middlewares/auth.middleware'

const router = express.Router()
router.post('/', verifyToken, createOrder)
router.get('/', verifyToken, getOrders)
router.get('/:id', verifyToken, getOneOrder)

export default  router;