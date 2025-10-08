"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresDeviceRepository = void 0;
const error_1 = require("@/core/service/error");
/**
 * PostgresDeviceRepository (Prisma)
 *
 * - Evita errores P2003 / P2025 asegurando que Owner y Computer/MedicalDevice existan
 *   antes de crear referencias (upsert).
 * - Mapea los resultados de Prisma al dominio (URL, fechas opcionales).
 */
class PostgresDeviceRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // Helper: asegura que exista el owner (upsert por id)
    async ensureOwner(owner) {
        if (!owner || !owner.id)
            return owner;
        await this.prisma.owner.upsert({
            where: { id: owner.id },
            create: { id: owner.id, name: owner.name },
            update: { name: owner.name },
        });
    }
    // --- COMPUTERS ---
    async getComputers(criteria) {
        const records = await this.prisma.computer.findMany({
            include: { owner: true },
        });
        return records.map((r) => ({
            id: r.id,
            brand: r.brand,
            model: r.model,
            color: r.color ?? undefined,
            owner: { id: r.owner.id, name: r.owner.name },
            photoURL: new URL(r.photoURL),
            checkinAt: r.checkinAt ?? undefined,
            checkoutAt: r.checkoutAt ?? undefined,
            updatedAt: r.updatedAt,
        }));
    }
    // --- MEDICAL DEVICES ---
    async getMedicalDevices(criteria) {
        const records = await this.prisma.medicalDevice.findMany({
            include: { owner: true },
        });
        return records.map((r) => ({
            id: r.id,
            brand: r.brand,
            model: r.model,
            owner: { id: r.owner.id, name: r.owner.name },
            photoURL: new URL(r.photoURL),
            // En tu schema el campo se llama `serial`
            serial: r.serial,
            checkinAt: r.checkinAt ?? undefined,
            checkoutAt: r.checkoutAt ?? undefined,
            updatedAt: r.updatedAt,
        }));
    }
    // --- FREQUENT COMPUTERS ---
    async registerFrequentComputer(computer) {
        // 1) Aseguramos owner/computer en la DB (evita FK errors)
        if (computer.device.owner) {
            await this.ensureOwner(computer.device.owner);
        }
        // Upsert del computer (si no existe lo creamos; si existe lo actualizamos ligeramente)
        await this.prisma.computer.upsert({
            where: { id: computer.device.id },
            create: {
                id: computer.device.id,
                brand: computer.device.brand,
                model: computer.device.model,
                color: computer.device.color ?? null,
                photoURL: computer.device.photoURL.toString(),
                ownerId: computer.device.owner.id,
                checkinAt: computer.device.checkinAt ?? null,
                checkoutAt: computer.device.checkoutAt ?? null,
                // updatedAt es @updatedAt, Prisma lo manejará
            },
            update: {
                brand: computer.device.brand,
                model: computer.device.model,
                color: computer.device.color ?? null,
                photoURL: computer.device.photoURL.toString(),
                ownerId: computer.device.owner.id,
                // no tocamos checkin/checkout aquí
            },
        });
        // 2) Crear FrequentComputer conectando el computer ya existente
        const fc = await this.prisma.frequentComputer.create({
            data: {
                computer: { connect: { id: computer.device.id } },
                checkinURL: computer.checkinURL.toString(),
                checkoutURL: computer.checkoutURL.toString(),
            },
            include: { computer: { include: { owner: true } } },
        });
        // Mapear a dominio (FrequentComputer)
        return {
            device: {
                id: fc.computer.id,
                brand: fc.computer.brand,
                model: fc.computer.model,
                color: fc.computer.color ?? undefined,
                owner: { id: fc.computer.owner.id, name: fc.computer.owner.name },
                photoURL: new URL(fc.computer.photoURL),
                checkinAt: fc.computer.checkinAt ?? undefined,
                checkoutAt: fc.computer.checkoutAt ?? undefined,
                updatedAt: fc.computer.updatedAt,
            },
            checkinURL: new URL(fc.checkinURL),
            checkoutURL: new URL(fc.checkoutURL),
        };
    }
    async getFrequentComputers(criteria) {
        const records = await this.prisma.frequentComputer.findMany({
            include: { computer: { include: { owner: true } } },
        });
        return records.map((fc) => ({
            device: {
                id: fc.computer.id,
                brand: fc.computer.brand,
                model: fc.computer.model,
                color: fc.computer.color ?? undefined,
                owner: { id: fc.computer.owner.id, name: fc.computer.owner.name },
                photoURL: new URL(fc.computer.photoURL),
                checkinAt: fc.computer.checkinAt ?? undefined,
                checkoutAt: fc.computer.checkoutAt ?? undefined,
                updatedAt: fc.computer.updatedAt,
            },
            checkinURL: new URL(fc.checkinURL),
            checkoutURL: new URL(fc.checkoutURL),
        }));
    }
    // --- ENTERED DEVICES (computers + medical + frequent) ---
    async getEnteredDevices(criteria) {
        const [computers, medicalDevices, frequentComputers] = await Promise.all([
            this.prisma.computer.findMany({
                where: { checkinAt: { not: null }, checkoutAt: null },
                include: { owner: true },
            }),
            this.prisma.medicalDevice.findMany({
                where: { checkinAt: { not: null }, checkoutAt: null },
                include: { owner: true },
            }),
            this.prisma.frequentComputer.findMany({
                include: { computer: { include: { owner: true } } },
            }),
        ]);
        const entered = [];
        computers.forEach((c) => entered.push({
            id: c.id,
            brand: c.brand,
            model: c.model,
            owner: { id: c.owner.id, name: c.owner.name },
            updatedAt: c.updatedAt,
            checkinAt: c.checkinAt,
            type: "computer",
        }));
        medicalDevices.forEach((m) => entered.push({
            id: m.id,
            brand: m.brand,
            model: m.model,
            owner: { id: m.owner.id, name: m.owner.name },
            updatedAt: m.updatedAt,
            checkinAt: m.checkinAt,
            type: "medical-device",
        }));
        frequentComputers.forEach((fc) => {
            const comp = fc.computer;
            if (comp && comp.checkinAt && !comp.checkoutAt) {
                entered.push({
                    id: comp.id,
                    brand: comp.brand,
                    model: comp.model,
                    owner: { id: comp.owner.id, name: comp.owner.name },
                    updatedAt: comp.updatedAt,
                    checkinAt: comp.checkinAt,
                    type: "frequent-computer",
                });
            }
        });
        return entered;
    }
    // --- CHECKIN COMPUTER ---
    async checkinComputer(computer) {
        // Aseguramos owner
        if (computer.owner) {
            await this.ensureOwner(computer.owner);
        }
        // Upsert computer (si no existe lo crea con checkinAt)
        const updated = await this.prisma.computer.upsert({
            where: { id: computer.id },
            create: {
                id: computer.id,
                brand: computer.brand,
                model: computer.model,
                color: computer.color ?? null,
                photoURL: computer.photoURL.toString(),
                ownerId: computer.owner.id,
                checkinAt: computer.checkinAt ?? new Date(),
            },
            update: {
                checkinAt: computer.checkinAt ?? new Date(),
                photoURL: computer.photoURL.toString(),
                brand: computer.brand,
                model: computer.model,
                color: computer.color ?? null,
            },
            include: { owner: true },
        });
        return {
            id: updated.id,
            brand: updated.brand,
            model: updated.model,
            color: updated.color ?? undefined,
            owner: { id: updated.owner.id, name: updated.owner.name },
            photoURL: new URL(updated.photoURL),
            checkinAt: updated.checkinAt ?? undefined,
            checkoutAt: updated.checkoutAt ?? undefined,
            updatedAt: updated.updatedAt,
        };
    }
    // --- CHECKIN MEDICAL DEVICE ---
    async checkinMedicalDevice(device) {
        if (device.owner) {
            await this.ensureOwner(device.owner);
        }
        // Upsert medical device (evita P2025)
        const updated = await this.prisma.medicalDevice.upsert({
            where: { id: device.id },
            create: {
                id: device.id,
                brand: device.brand,
                model: device.model,
                photoURL: device.photoURL.toString(),
                ownerId: device.owner.id,
                serial: device.serial,
                checkinAt: device.checkinAt ?? new Date(),
            },
            update: {
                checkinAt: device.checkinAt ?? new Date(),
                photoURL: device.photoURL.toString(),
                brand: device.brand,
                model: device.model,
                serial: device.serial,
            },
            include: { owner: true },
        });
        return {
            id: updated.id,
            brand: updated.brand,
            model: updated.model,
            owner: { id: updated.owner.id, name: updated.owner.name },
            photoURL: new URL(updated.photoURL),
            serial: updated.serial,
            checkinAt: updated.checkinAt ?? undefined,
            checkoutAt: updated.checkoutAt ?? undefined,
            updatedAt: updated.updatedAt,
        };
    }
    // --- CHECKIN FREQUENT COMPUTER (by id) ---
    async checkinFrequentComputer(id, datetime) {
        // Buscar registro frequentComputer (por computerId)
        const fc = await this.prisma.frequentComputer.findUnique({
            where: { computerId: id },
            include: { computer: { include: { owner: true } } },
        });
        if (!fc) {
            throw error_1.SERVICE_ERRORS.DeviceNotFound;
        }
        // Actualizamos el computer (upsert no necesario porque existe si fc exists)
        const updatedComputer = await this.prisma.computer.update({
            where: { id },
            data: { checkinAt: datetime },
            include: { owner: true },
        });
        return {
            device: {
                id: updatedComputer.id,
                brand: updatedComputer.brand,
                model: updatedComputer.model,
                color: updatedComputer.color ?? undefined,
                owner: { id: updatedComputer.owner.id, name: updatedComputer.owner.name },
                photoURL: new URL(updatedComputer.photoURL),
                checkinAt: updatedComputer.checkinAt ?? undefined,
                checkoutAt: updatedComputer.checkoutAt ?? undefined,
                updatedAt: updatedComputer.updatedAt,
            },
            checkinURL: new URL(fc.checkinURL),
            checkoutURL: new URL(fc.checkoutURL),
        };
    }
    // --- CHECKOUT DEVICE ---
    async checkoutDevice(id, datetime) {
        // Intentamos actualizar Computer; si existe actualizamos y salimos.
        const comp = await this.prisma.computer.findUnique({ where: { id } });
        if (comp) {
            await this.prisma.computer.update({ where: { id }, data: { checkoutAt: datetime } });
            return;
        }
        // Intentamos MedicalDevice
        const med = await this.prisma.medicalDevice.findUnique({ where: { id } });
        if (med) {
            await this.prisma.medicalDevice.update({ where: { id }, data: { checkoutAt: datetime } });
            return;
        }
        // Si no existe en ninguno, error
        throw error_1.SERVICE_ERRORS.DeviceNotFound;
    }
    // --- IS DEVICE ENTERED ---
    async isDeviceEntered(id) {
        const computer = await this.prisma.computer.findFirst({
            where: { id, checkinAt: { not: null }, checkoutAt: null },
        });
        if (computer)
            return true;
        const medical = await this.prisma.medicalDevice.findFirst({
            where: { id, checkinAt: { not: null }, checkoutAt: null },
        });
        if (medical)
            return true;
        return false;
    }
    // --- IS FREQUENT REGISTERED ---
    async isFrequentComputerRegistered(id) {
        const fc = await this.prisma.frequentComputer.findUnique({ where: { computerId: id } });
        return !!fc;
    }
}
exports.PostgresDeviceRepository = PostgresDeviceRepository;
