"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const product_schema_1 = require("../schemas/product.schema");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = express_1.default.Router();
router.get('/', product_controller_1.getAll);
router.get('/:id', product_controller_1.getOne);
router.post('/', auth_middleware_1.verifyToken, upload_middleware_1.upload.single('imagen'), (0, validate_middleware_1.validate)(product_schema_1.createProductSchema), product_controller_1.create);
router.put('/:id', auth_middleware_1.verifyToken, upload_middleware_1.upload.single('imagen'), (0, validate_middleware_1.validate)(product_schema_1.createProductSchema), product_controller_1.update);
router.delete('/:id', auth_middleware_1.verifyToken, product_controller_1.remove);
exports.default = router;
