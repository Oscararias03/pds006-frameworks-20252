import { DevicePhotoRepository } from "@/core/repository";
import { DeviceId } from "@core/domain";
import axios from "axios";

export class FilesystemPhotoRepository implements DevicePhotoRepository {
  async savePhoto(file: File, id: DeviceId): Promise<URL> {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error("IMGBB_API_KEY no está configurada en el archivo .env");
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      const formData = new FormData();
      formData.append("image", base64);
      formData.append("name", `${id}-${Date.now()}`);

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        formData
      );

      const imageUrl = response.data.data.url;
      return new URL(imageUrl);
    } catch (error: any) {
      console.error("Error al subir imagen a ImgBB:", error.response?.data || error);
      throw new Error("No se pudo subir la imagen a ImgBB");
    }
  }
}
