import express from 'express'
import { getAll, getOne, create, update, remove } from '../controllers/category.controller'
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createCategorySchema } from '../schemas/category.schema'

const router = express.Router()

router.get('/', getAll)
router.get('/:id', getOne)
router.post('/', verifyToken, requireAdmin, validate(createCategorySchema), create)
router.put('/:id', verifyToken, requireAdmin, validate(createCategorySchema), update)
router.delete('/:id', verifyToken, requireAdmin, remove)

export default router