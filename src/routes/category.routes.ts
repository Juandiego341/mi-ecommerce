import express from 'express'
import { getAll, getOne, create, update, remove } from '../controllers/category.controller'
import { verifyToken } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createCategorySchema } from '../schemas/category.schema'

const router = express.Router()

router.get('/', getAll)
router.get('/:id', getOne)
router.post('/', verifyToken, validate(createCategorySchema), create)
router.put('/:id', verifyToken, validate(createCategorySchema), update)
router.delete('/:id', verifyToken, remove)

export default router