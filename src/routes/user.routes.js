const express = require('express')
const router = express.Router()
const { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/user.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

router.get('/profile', verifyToken, getProfile)
router.put('/profile', verifyToken, updateProfile)
router.get('/address', verifyToken, getAddresses)
router.post('/address', verifyToken, addAddress)
router.put('/address/:id', verifyToken, updateAddress)
router.delete('/address/:id', verifyToken, deleteAddress)


module.exports = router