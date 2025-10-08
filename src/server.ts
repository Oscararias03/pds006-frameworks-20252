import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { FilesystemPhotoRepository } from "@adapter/photo/filesystem/filesystemPhotoRepository";

dotenv.config();

const app = express();
const upload = multer(); // Almacena el archivo en memoria

const photoRepository = new FilesystemPhotoRepository();

// Ruta para subir una imagen
app.post("/upload/:deviceId", upload.single("photo"), async (req, res) => {
  try {
    const { deviceId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No se envió ninguna imagen" });
    }

    // ✅ Enviar directamente el archivo de multer al repositorio
    const imageUrl = await photoRepository.savePhoto(file as any, deviceId);

    return res.json({
      message: "Imagen subida correctamente",
      url: imageUrl.toString(),
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return res.status(500).json({ message: "Error al subir la imagen" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
