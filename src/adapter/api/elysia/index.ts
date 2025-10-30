import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import { Controller } from "./controller";
import Elysia from "elysia";
import openapi from "@elysiajs/openapi";

export class ElysiaApiAdapter {
    private controller: Controller
    public app: Elysia

    constructor(
        computerService: ComputerService,
        deviceService: DeviceService,
        medicalDeviceService: MedicalDeviceService
    ) {
        this.controller = new Controller(
            computerService,
            deviceService,
            medicalDeviceService
        )
        this.app = new Elysia()
            .use(openapi({}))
            .use(this.controller.routes())
            .listen(3000)
    }

    async run() {
        this.app.listen(3000)

        console.log("El servidor esta corriendo en el puerto 3000")
    }
}