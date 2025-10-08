"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MED_DEVICE_REQUEST_SCHEMA = void 0;
exports.mapRequestToMedicalDevice = mapRequestToMedicalDevice;
const utils_1 = require("@core/utils");
const z = __importStar(require("zod"));
exports.MED_DEVICE_REQUEST_SCHEMA = z.object({
    brand: z.string().min(2).max(50),
    model: z.string().min(1).max(50),
    ownerName: z.string().min(5).max(150),
    ownerId: z.string().min(5).max(20),
    photo: utils_1.VALIDATION_SCHEMAS.Image,
    serial: z.string().min(6).max(30)
});
function mapRequestToMedicalDevice(request, deviceId, photoURL) {
    return {
        id: deviceId,
        brand: request.brand,
        model: request.model,
        owner: {
            name: request.ownerName,
            id: request.ownerId
        },
        serial: request.serial,
        updatedAt: new Date(),
        photoURL,
    };
}
