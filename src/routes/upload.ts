import { Elysia } from 'elysia';
import { writeFile } from 'fs/promises';
import path from 'path';

export const uploadRoutes = new Elysia({ prefix: '/upload' })
  .post('/:deviceId', async ({ params, request, set }) => {
    try {
      const { deviceId } = params;

      // Verifica tipo de contenido
      const contentType = request.headers.get('content-type') || '';
      if (!contentType.includes('multipart/form-data')) {
        set.status = 400;
        return { error: 'El contenido debe ser multipart/form-data' };
      }

      // Convierte la petición a FormData
      const formData = await request.formData();
      const file = formData.get('photo');

      if (!file || typeof file === 'string') {
        set.status = 400;
        return { error: 'No se recibió ningún archivo en el campo "photo"' };
      }

      // Guarda el archivo
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadDir, `${deviceId}-${file.name}`);

      await writeFile(filePath, buffer);
      console.log(`Archivo guardado en ${filePath}`);

      return { message: 'Archivo subido correctamente', path: filePath };
    } catch (error) {
      console.error('Error al subir imagen:', error);
      set.status = 500;
      return { error: 'Error interno al procesar el archivo' };
    }
  });
