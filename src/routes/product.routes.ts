import express from 'express'
import { getAll, getOne, create, update, remove } from '../controllers/product.controller'
import { verifyToken } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createProductSchema } from '../schemas/product.schema'
import { upload } from '../middlewares/upload.middleware'

const router = express.Router()

router.get('/', getAll)
router.get('/:id', getOne)
router.post('/', verifyToken,upload.single('imagen'), validate(createProductSchema), create)
router.put('/:id', verifyToken,upload.single('imagen'), validate(createProductSchema), update)
router.delete('/:id', verifyToken, remove)

export default router