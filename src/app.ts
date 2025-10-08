import { Elysia } from "elysia";
import { uploadRoute } from "./routes/upload";

export const app = new Elysia().use(uploadRoute);
