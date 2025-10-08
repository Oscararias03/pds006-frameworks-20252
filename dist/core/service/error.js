"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVICE_ERRORS = exports.ServiceError = void 0;
const utils_1 = require("@core/utils");
class ServiceError extends utils_1.ErrorBase {
}
exports.ServiceError = ServiceError;
exports.SERVICE_ERRORS = {
    DeviceNotFound: new ServiceError('DEVICE_NOT_FOUND', "Dispositivo no encontrado")
};
