import express  from 'express'
import { getAll, getOne, create, update, remove } from '../controllers/category.controller'
import { verifyToken }  from '../middlewares/auth.middleware'

const router = express.Router()

router.get('/', getAll)
router.get('/:id', getOne)
router.post('/', verifyToken, create)
router.put('/:id', verifyToken, update)
router.delete('/:id', verifyToken, remove)

export default  router