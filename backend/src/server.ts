import "./util/module-alias";
import * as http from "http";

import { Server } from "@overnightjs/core";
import bodyParser from "body-parser";
import cors from "cors";
import { Application } from "express";

import * as database from "@src/database";

import { AutoClockController } from "./controllers/autoClock";
import { UsersController } from "./controllers/users";

export class SetupServer extends Server {
  private server?: http.Server;

  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.databaseSetup();
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
    const usersController = new UsersController();
    const autoClockController = new AutoClockController();
    this.addControllers([usersController, autoClockController]);
  }

  public getApp(): Application {
    return this.app;
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
    if (this.server) {
      await new Promise((resolve, reject) => {
        this.server?.close((err) => {
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
      });
    }
  }

  public start(): void {
    this.server = this.app.listen(this.port, () => {
      console.info("Server listening on port: " + this.port);
    });
  }
}
