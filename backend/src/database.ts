import config, { IConfig } from "config";
import { connection, connect as mongooseConnect } from "mongoose";

const dbConfig: IConfig = config.get("App.database");

export const connect = async (): Promise<void> => {
  await mongooseConnect(dbConfig.get("mongoUrl"));
};

export const close = (): Promise<void> => connection.close();
