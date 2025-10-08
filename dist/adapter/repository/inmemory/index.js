"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryDeviceRepository = void 0;
const error_1 = require("@/core/service/error");
class InMemoryDeviceRepository {
    constructor() {
        this.computers = new Map();
        this.medicalDevices = new Map();
        this.enteredDevices = new Map();
        this.frequentComputers = new Map();
    }
    async getComputers(criteria) {
        return Array.from(this.computers.values());
    }
    async getMedicalDevices(criteria) {
        return Array.from(this.medicalDevices.values());
    }
    async registerFrequentComputer(computer) {
        this.frequentComputers.set(computer.device.id, computer);
        return computer;
    }
    async getFrequentComputers(criteria) {
        return Array.from(this.frequentComputers.values());
    }
    async getEnteredDevices(criteria) {
        return Array.from(this.enteredDevices.values());
    }
    async checkinComputer(computer) {
        this.computers.set(computer.id, computer);
        this.enteredDevices.set(computer.id, this.mapDeviceFromComputer(computer));
        return computer;
    }
    async checkinMedicalDevice(device) {
        this.medicalDevices.set(device.id, device);
        this.enteredDevices.set(device.id, this.mapDeviceFromMedicalDevice(device));
        return device;
    }
    async checkinFrequentComputer(id, datetime) {
        if (!this.frequentComputers.has(id)) {
            throw error_1.SERVICE_ERRORS.DeviceNotFound;
        }
        const computer = this.frequentComputers.get(id);
        computer.device.checkinAt = datetime;
        this.enteredDevices.set(id, this.mapDeviceFromFrequentComputer(computer));
        return computer;
    }
    async checkoutDevice(id, datetime) {
        if (!this.enteredDevices.has(id)) {
            throw error_1.SERVICE_ERRORS.DeviceNotFound;
        }
        const device = this.enteredDevices.get(id);
        switch (device.type) {
            case "computer":
                this.computers.get(id).checkoutAt = datetime;
            case "medical-device":
                this.medicalDevices.get(id).checkoutAt = datetime;
            case "frequent-computer":
                this.frequentComputers.get(id).device.checkoutAt = datetime;
                break;
        }
        this.enteredDevices.delete(id);
    }
    async isDeviceEntered(id) {
        return this.enteredDevices.has(id);
    }
    async isFrequentComputerRegistered(id) {
        return this.frequentComputers.has(id);
    }
    mapDeviceFromComputer(computer) {
        return {
            id: computer.id,
            brand: computer.brand,
            model: computer.model,
            owner: computer.owner,
            updatedAt: new Date(),
            checkinAt: new Date(),
            type: "computer"
        };
    }
    mapDeviceFromMedicalDevice(device) {
        return {
            id: device.id,
            brand: device.brand,
            model: device.model,
            owner: device.owner,
            updatedAt: new Date(),
            checkinAt: new Date(),
            type: "medical-device"
        };
    }
    mapDeviceFromFrequentComputer(computer) {
        return {
            id: computer.device.id,
            brand: computer.device.brand,
            model: computer.device.model,
            owner: computer.device.owner,
            updatedAt: new Date(),
            checkinAt: new Date(),
            type: "frequent-computer"
        };
    }
}
exports.InMemoryDeviceRepository = InMemoryDeviceRepository;
