"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helper = void 0;
class Helper {
    static generateDeviceId() {
        return crypto.randomUUID();
    }
    static getFrequentCheckinURL(deviceId, baseURL) {
        return new URL(`/frequent/checkin/${deviceId}`, baseURL);
    }
    static getFrequentCheckoutURL(deviceId, baseURL) {
        return new URL(`/device/checkout/${deviceId}`, baseURL);
    }
}
exports.Helper = Helper;
