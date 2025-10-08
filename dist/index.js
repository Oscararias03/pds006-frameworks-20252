"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elysia_1 = require("elysia");
const app = new elysia_1.Elysia().get("/", () => "Hello Elysia").listen(3000);
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
