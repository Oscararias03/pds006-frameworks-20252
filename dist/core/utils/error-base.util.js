"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBase = void 0;
class ErrorBase extends Error {
    constructor(name, message, cause) {
        super();
        this.name = name;
        this.message = message;
        this.cause = cause;
    }
}
exports.ErrorBase = ErrorBase;
