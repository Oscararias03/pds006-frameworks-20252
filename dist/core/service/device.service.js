"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceService = void 0;
const error_1 = require("./error");
class DeviceService {
    constructor(repository) {
        this.repository = repository;
    }
    async checkoutDevice(id) {
        const isDeviceEntered = await this.repository.isDeviceEntered(id);
        if (!isDeviceEntered) {
            throw error_1.SERVICE_ERRORS.DeviceNotFound;
        }
        await this.repository.checkoutDevice(id, new Date());
    }
    async getEnteredDevices(criteria) {
        return this.repository.getEnteredDevices(criteria);
    }
}
exports.DeviceService = DeviceService;
