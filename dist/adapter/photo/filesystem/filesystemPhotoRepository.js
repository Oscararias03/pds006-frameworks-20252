"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesystemPhotoRepository = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class FilesystemPhotoRepository {
    async savePhoto(file, id) {
        const apiKey = process.env.IMGBB_API_KEY;
        if (!apiKey) {
            throw new Error("IMGBB_API_KEY no está configurada en el archivo .env");
        }
        let base64;
        // 🔹 Si el archivo viene desde Multer (Node.js)
        if (file.buffer) {
            base64 = file.buffer.toString("base64");
        }
        // 🔹 Si el archivo viene del navegador (por ejemplo, en frontend)
        else if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer();
            base64 = Buffer.from(arrayBuffer).toString("base64");
        }
        else {
            throw new Error("Tipo de archivo no soportado");
        }
        const formData = new form_data_1.default();
        formData.append("image", base64);
        formData.append("name", `${id}-${Date.now()}`);
        try {
            const response = await axios_1.default.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData, { headers: formData.getHeaders() });
            const imageUrl = response.data.data.url;
            return new URL(imageUrl);
        }
        catch (error) {
            console.error("Error al subir imagen a ImgBB:", error.response?.data || error);
            throw new Error("No se pudo subir la imagen a ImgBB");
        }
    }
}
exports.FilesystemPhotoRepository = FilesystemPhotoRepository;
