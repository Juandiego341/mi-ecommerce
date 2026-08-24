import express from 'express'
import { getAll, getOne, create, update, remove, importProducts } from '../controllers/product.controller'
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createProductSchema } from '../schemas/product.schema'
import { upload, uploadExcel } from '../middlewares/upload.middleware'

const router = express.Router()

router.get('/', getAll)
router.get('/:id', getOne)
router.post('/import', verifyToken, requireAdmin, uploadExcel.single('file'), importProducts)
router.post('/', verifyToken, requireAdmin, upload.single('imagen'), validate(createProductSchema), create)
router.put('/:id', verifyToken, requireAdmin, upload.single('imagen'), validate(createProductSchema), update)
router.delete('/:id', verifyToken, requireAdmin, remove)

export default router
