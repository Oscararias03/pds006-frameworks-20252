"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = __importDefault(require("@/infra/prismaClient"));
const bun_test_1 = require("bun:test");
const postgres_device_repository_1 = require("../postgres/postgres-device.repository");
(0, bun_test_1.describe)("DeviceRepository contract tests", () => {
    let repo;
    (0, bun_test_1.beforeAll)(async () => {
        await prismaClient_1.default.$connect();
    });
    (0, bun_test_1.afterAll)(async () => {
        await prismaClient_1.default.$disconnect();
    });
    (0, bun_test_1.beforeEach)(async () => {
        // Limpiamos tablas dependientes primero
        await prismaClient_1.default.frequentComputer.deleteMany();
        await prismaClient_1.default.computer.deleteMany();
        await prismaClient_1.default.medicalDevice.deleteMany();
        await prismaClient_1.default.owner.deleteMany();
        // Creamos un Owner
        const owner = await prismaClient_1.default.owner.create({
            data: {
                name: "John Doe",
            },
        });
        // Creamos un Computer
        const computer = await prismaClient_1.default.computer.create({
            data: {
                brand: "Dell",
                model: "XPS 13",
                color: "Silver",
                photoURL: "http://localhost/fake-photo.jpg",
                ownerId: owner.id,
            },
        });
        // Creamos un MedicalDevice (ojo con el campo serial obligatorio)
        await prismaClient_1.default.medicalDevice.create({
            data: {
                brand: "Philips",
                model: "MRI Scanner",
                photoURL: "http://localhost/fake-photo.jpg",
                ownerId: owner.id,
                serial: "MD-12345",
            },
        });
        // Creamos un FrequentComputer
        await prismaClient_1.default.frequentComputer.create({
            data: {
                computerId: computer.id,
                checkinURL: "http://localhost/checkin",
                checkoutURL: "http://localhost/checkout",
            },
        });
        // Inicializa el repo que vas a probar
        repo = new postgres_device_repository_1.PostgresDeviceRepository(prismaClient_1.default);
    });
    (0, bun_test_1.it)("registerFrequentComputer should persist and return a frequent computer", async () => {
        const computer = {
            id: "comp-1",
            brand: "Dell",
            model: "XPS",
            owner: { name: "Alice", id: "owner-1" },
            photoURL: new URL("http://example.com/photo.png"),
            updatedAt: new Date(),
            checkinAt: new Date(),
        };
        const frequent = {
            device: computer,
            checkinURL: new URL("http://example.com/checkin"),
            checkoutURL: new URL("http://example.com/checkout"),
        };
        const saved = await repo.registerFrequentComputer(frequent);
        (0, bun_test_1.expect)(saved.device.id).toBe("comp-1");
        const results = await repo.getFrequentComputers({});
        (0, bun_test_1.expect)(results.some(r => r.device.id === "comp-1")).toBe(true);
    });
    (0, bun_test_1.it)("getMedicalDevices should return medical devices filtered by criteria", async () => {
        const device = {
            id: "med-1",
            brand: "MedTech",
            model: "HeartMonitor",
            owner: { name: "Clinic", id: "c-1" },
            updatedAt: new Date(),
            photoURL: new URL("http://example.com/photo2.png"),
            serial: "7312-1712-0719",
            checkinAt: new Date(),
        };
        await repo.checkinMedicalDevice(device);
        const devices = await repo.getMedicalDevices({});
        (0, bun_test_1.expect)(devices.find(d => d.id === "med-1")).toBeDefined();
    });
    (0, bun_test_1.it)("getComputers should return computers after check-in", async () => {
        const computer = {
            id: "comp-2",
            brand: "HP",
            model: "Elitebook",
            owner: { name: "Bob", id: "owner-2" },
            photoURL: new URL("http://example.com/photo2.png"),
            updatedAt: new Date(),
            checkinAt: new Date(),
        };
        await repo.checkinComputer(computer);
        const computers = await repo.getComputers({});
        (0, bun_test_1.expect)(computers.some(c => c.id === "comp-2")).toBe(true);
    });
    (0, bun_test_1.it)("getEnteredDevices should include all device types", async () => {
        const computer = {
            id: "comp-3",
            brand: "Lenovo",
            model: "ThinkPad",
            owner: { name: "Charlie", id: "owner-3" },
            photoURL: new URL("http://example.com/photo3.png"),
            updatedAt: new Date(),
            checkinAt: new Date(),
        };
        await repo.checkinComputer(computer);
        const entered = await repo.getEnteredDevices({});
        (0, bun_test_1.expect)(entered.some(e => e.id === "comp-3")).toBe(true);
    });
    (0, bun_test_1.it)("checkinComputer should set checkinAt timestamp", async () => {
        const computer = {
            id: "comp-4",
            brand: "Apple",
            model: "MacBook Pro",
            owner: { name: "Dana", id: "owner-4" },
            photoURL: new URL("http://example.com/photo4.png"),
            updatedAt: new Date(),
            checkinAt: new Date(),
        };
        const checkedIn = await repo.checkinComputer(computer);
        (0, bun_test_1.expect)(checkedIn.checkinAt).toBeInstanceOf(Date);
    });
    (0, bun_test_1.it)("checkinMedicalDevice should set checkinAt timestamp", async () => {
        const med = {
            id: "med-2",
            brand: "MedEquip",
            model: "Scanner",
            owner: { name: "Hospital", id: "h-1" },
            updatedAt: new Date(),
            photoURL: new URL("http://example.com/photo2.png"),
            serial: "7312-1712-0719",
            checkinAt: new Date(),
        };
        const checkedIn = await repo.checkinMedicalDevice(med);
        (0, bun_test_1.expect)(checkedIn.checkinAt).toBeInstanceOf(Date);
    });
    (0, bun_test_1.it)("checkinFrequentComputer should update checkinAt timestamp", async () => {
        const computer = {
            id: "comp-5",
            brand: "Asus",
            model: "ZenBook",
            owner: { name: "Eve", id: "owner-5" },
            photoURL: new URL("http://example.com/photo5.png"),
            updatedAt: new Date(),
        };
        const frequent = {
            device: computer,
            checkinURL: new URL("http://example.com/checkin"),
            checkoutURL: new URL("http://example.com/checkout"),
        };
        await repo.registerFrequentComputer(frequent);
        const checkedIn = await repo.checkinFrequentComputer("comp-5", new Date());
        (0, bun_test_1.expect)(checkedIn.device.checkinAt).toBeInstanceOf(Date);
    });
    (0, bun_test_1.it)("checkoutDevice should set checkoutAt timestamp", async () => {
        const computer = {
            id: "comp-6",
            brand: "Acer",
            model: "Swift",
            owner: { name: "Frank", id: "owner-6" },
            photoURL: new URL("http://example.com/photo6.png"),
            updatedAt: new Date(),
        };
        await repo.checkinComputer(computer);
        await repo.checkoutDevice("comp-6", new Date());
        const computers = await repo.getComputers({});
        const found = computers.find(c => c.id === "comp-6");
        (0, bun_test_1.expect)(found?.checkoutAt).toBeInstanceOf(Date);
    });
});
