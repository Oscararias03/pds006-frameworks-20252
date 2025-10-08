import { Elysia } from 'elysia';
import { uploadRoutes } from './routes/upload';

const app = new Elysia();

app.use(uploadRoutes);

app.listen(3000);
console.log('🦊 Elysia is running at http://localhost:3000');
