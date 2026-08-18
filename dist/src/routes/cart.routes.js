"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_controller_1 = require("../controllers/cart.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.verifyToken, cart_controller_1.getCart);
router.post('/items', auth_middleware_1.verifyToken, cart_controller_1.addItem);
router.put('/items/:id', auth_middleware_1.verifyToken, cart_controller_1.updateItem);
router.delete('/items/:id', auth_middleware_1.verifyToken, cart_controller_1.removeItem);
router.delete('/', auth_middleware_1.verifyToken, cart_controller_1.clearCart);
exports.default = router;
