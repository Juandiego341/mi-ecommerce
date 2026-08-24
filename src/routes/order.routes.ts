import express from 'express'
import { createOrder, getOrders, getOneOrder, updateOrderStatus, updateOrderFulfillment, getAllOrdersAdmin } from '../controllers/order.controller'
import { verifyToken, requireAdmin } from'../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { updateOrderStatusSchema, updateOrderFulfillmentSchema } from '../schemas/order.schema'

const router = express.Router()
router.post('/', verifyToken, createOrder)
router.get('/', verifyToken, getOrders)
router.get('/admin', verifyToken, requireAdmin, getAllOrdersAdmin)
router.get('/:id', verifyToken, getOneOrder)
router.patch('/:id/status', verifyToken, requireAdmin, validate(updateOrderStatusSchema), updateOrderStatus)
router.patch('/:id/fulfillment', verifyToken, requireAdmin, validate(updateOrderFulfillmentSchema), updateOrderFulfillment)

export default  router;
