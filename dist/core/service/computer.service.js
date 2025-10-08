"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputerService = void 0;
const dto_1 = require("@core/dto");
const error_1 = require("./error");
const helper_1 = require("./helper");
class ComputerService {
    constructor(repository, photoRepository, baseURL) {
        this.repository = repository;
        this.photoRepository = photoRepository;
        this.baseURL = baseURL;
    }
    async getFrequentComputers(criteria) {
        return this.repository.getFrequentComputers(criteria);
    }
    async getComputers(criteria) {
        return this.repository.getComputers(criteria);
    }
    async registerFrequentComputer(request) {
        const device = await this.generateComputerFromRequest(request);
        const frequentComputer = {
            device,
            checkinURL: helper_1.Helper.getFrequentCheckinURL(device.id, this.baseURL),
            checkoutURL: helper_1.Helper.getFrequentCheckoutURL(device.id, this.baseURL)
        };
        await this.repository.registerFrequentComputer(frequentComputer);
        return frequentComputer;
    }
    async checkinComputer(request) {
        const computer = await this.generateComputerFromRequest(request);
        computer.checkinAt = new Date();
        this.repository.checkinComputer(computer);
        return computer;
    }
    async checkinFrequentComputer(id) {
        const isComputerRegistered = await this.repository.isFrequentComputerRegistered(id);
        if (!isComputerRegistered) {
            throw error_1.SERVICE_ERRORS.DeviceNotFound;
        }
        return this.repository.checkinFrequentComputer(id, new Date());
    }
    async generateComputerFromRequest(request) {
        dto_1.COMPUTER_REQUEST_SCHEMA.parse(request);
        const deviceId = helper_1.Helper.generateDeviceId();
        const photoURL = await this.photoRepository.savePhoto(request.photo, deviceId);
        return (0, dto_1.mapRequestToComputer)(request, deviceId, photoURL);
    }
}
exports.ComputerService = ComputerService;
