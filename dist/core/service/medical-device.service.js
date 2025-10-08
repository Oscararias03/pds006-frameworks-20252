"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalDeviceService = void 0;
const dto_1 = require("@core/dto");
const helper_1 = require("./helper");
class MedicalDeviceService {
    constructor(repository, photoRepository) {
        this.repository = repository;
        this.photoRepository = photoRepository;
    }
    async checkinMedicalDevice(request) {
        dto_1.MED_DEVICE_REQUEST_SCHEMA.parse(request);
        const deviceId = helper_1.Helper.generateDeviceId();
        const photoURL = await this.photoRepository.savePhoto(request.photo, deviceId);
        const device = (0, dto_1.mapRequestToMedicalDevice)(request, deviceId, photoURL);
        device.checkinAt = new Date();
        return await this.repository.checkinMedicalDevice(device);
    }
}
exports.MedicalDeviceService = MedicalDeviceService;
