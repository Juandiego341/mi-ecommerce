"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const error_middleware_1 = require("./middlewares/error.middleware");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(rateLimit_middleware_1.generalLimiter);
app.use('/auth', rateLimit_middleware_1.authLimiter, auth_routes_1.default);
app.use('/category', category_routes_1.default);
app.use('/product', product_routes_1.default);
app.use('/cart', cart_routes_1.default);
app.use('/order', order_routes_1.default);
app.use('/user', user_routes_1.default);
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.json({ message: '🚀 API ecommerce funcionando' });
});
app.use(error_middleware_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
