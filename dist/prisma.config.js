"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@prisma/config");
require("dotenv/config");
exports.default = (0, config_1.defineConfig)({
    earlyAccess: true,
    schema: 'prisma/schema.prisma',
    // El CLI busca esta propiedad específica para comandos como 'migrate' y 'db pull'
    datasource: {
        url: process.env.DATABASE_URL,
    },
    // Tu configuración de adapter para el runtime (opcional aquí, pero útil)
    client: {
        adapter: async () => {
            const { PrismaPg } = await Promise.resolve().then(() => __importStar(require('@prisma/adapter-pg')));
            const { default: pg } = await Promise.resolve().then(() => __importStar(require('pg')));
            const pool = new pg.Pool({
                connectionString: process.env.DATABASE_URL,
            });
            return new PrismaPg(pool);
        }
    }
});
