"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const category_schema_1 = require("../schemas/category.schema");
const router = express_1.default.Router();
router.get('/', category_controller_1.getAll);
router.get('/:id', category_controller_1.getOne);
router.post('/', auth_middleware_1.verifyToken, (0, validate_middleware_1.validate)(category_schema_1.createCategorySchema), category_controller_1.create);
router.put('/:id', auth_middleware_1.verifyToken, (0, validate_middleware_1.validate)(category_schema_1.createCategorySchema), category_controller_1.update);
router.delete('/:id', auth_middleware_1.verifyToken, category_controller_1.remove);
exports.default = router;
