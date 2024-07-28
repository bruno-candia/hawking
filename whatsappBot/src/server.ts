import "module-alias/register";
import "./util/module-alias";
import * as http from "http";

import { Server } from "@overnightjs/core";
import bodyParser from "body-parser";
import cors from "cors";
import { Application } from "express";

import { WhatsappController } from "./infrastructure/social/whatsapp/controllers/WhatsappController";
import WhatsappClient from "./infrastructure/social/whatsapp/WhatsappClient";

export class SetupServer extends Server {
  private server?: http.Server;

  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await WhatsappClient.initialize();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(
      cors({
        origin: "*",
      }),
    );
  }

  private setupControllers(): void {
    const whatsappController = new WhatsappController();
    super.addControllers([whatsappController]);
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.server = this.app.listen(this.port, () => {
      console.log("Server listening on port: " + this.port);
    });
  }
}
