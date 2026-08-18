"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get('/profile', auth_middleware_1.verifyToken, user_controller_1.getProfile);
router.put('/profile', auth_middleware_1.verifyToken, user_controller_1.updateProfile);
router.get('/address', auth_middleware_1.verifyToken, user_controller_1.getAddresses);
router.post('/address', auth_middleware_1.verifyToken, user_controller_1.addAddress);
router.put('/address/:id', auth_middleware_1.verifyToken, user_controller_1.updateAddress);
router.delete('/address/:id', auth_middleware_1.verifyToken, user_controller_1.deleteAddress);
exports.default = router;
