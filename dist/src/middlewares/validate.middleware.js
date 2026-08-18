"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return (req, res, next) => {
        console.log('Body en validate:', req.body);
        console.log('File en validate:', req.file);
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            console.log('Error de validación:', JSON.stringify(error.issues, null, 2));
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    code: 'VALIDATION_ERROR',
                    message: 'Datos inválidos',
                    errors: error.issues.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            else {
                res.status(500).json({
                    code: 'SERVER_ERROR',
                    message: 'Error en el servidor'
                });
            }
        }
    };
};
exports.validate = validate;
