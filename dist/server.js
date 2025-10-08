"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
const filesystemPhotoRepository_1 = require("@adapter/photo/filesystem/filesystemPhotoRepository");
dotenv_1.default.config();
const app = (0, express_1.default)();
const upload = (0, multer_1.default)(); // Almacena el archivo en memoria
const photoRepository = new filesystemPhotoRepository_1.FilesystemPhotoRepository();
// Ruta para subir una imagen
app.post("/upload/:deviceId", upload.single("photo"), async (req, res) => {
    try {
        const { deviceId } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No se envió ninguna imagen" });
        }
        // ✅ Enviar directamente el archivo de multer al repositorio
        const imageUrl = await photoRepository.savePhoto(file, deviceId);
        return res.json({
            message: "Imagen subida correctamente",
            url: imageUrl.toString(),
        });
    }
    catch (error) {
        console.error("Error al subir imagen:", error);
        return res.status(500).json({ message: "Error al subir la imagen" });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
