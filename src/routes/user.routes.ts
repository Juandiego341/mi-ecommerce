import express from 'express'
import { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress } from '../controllers/user.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = express.Router()

router.get('/profile', verifyToken, getProfile)
router.put('/profile', verifyToken, updateProfile)
router.get('/address', verifyToken, getAddresses)
router.post('/address', verifyToken, addAddress)
router.put('/address/:id', verifyToken, updateAddress)
router.delete('/address/:id', verifyToken, deleteAddress)

export default router