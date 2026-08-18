"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImage = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadImage = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary_1.default.uploader.upload_stream({
            folder,
            resource_type: 'image'
        }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result.secure_url);
        }).end(buffer);
    });
};
exports.uploadImage = uploadImage;
const deleteImage = async (imageUrl) => {
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary_1.default.uploader.destroy(publicId);
};
exports.deleteImage = deleteImage;
