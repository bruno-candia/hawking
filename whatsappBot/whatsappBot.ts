import * as fs from "fs";
import * as path from "path";

import config, { IConfig } from "config";
import { CountryCode, getCountryCallingCode } from "libphonenumber-js";
import qr from "qr-image";
import { Client, LocalAuth } from "whatsapp-web.js";

import { findChrome } from "../src/util/chrome-finder";
import { InternalError } from "../src/util/errors/internal-error";

const whatsappBotConfig: IConfig = config.get("App.resources.WhatsappBot");

export class WhatsAppBotUnexpectedResponseError extends InternalError {
  constructor(message: string) {
    super(message);
  }
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      "Unexpected error when trying to communicate with WhatsApp";
    super(`${internalMessage}: ${message}`);
  }
}

export class WhatsAppBotResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage = "Unexpected error returned by the WhatsAppBot";
    super(`${internalMessage}: ${message}`);
  }
}

export class NumberNotRegisteredError extends InternalError {
  constructor(message: string) {
    const internalMessage = "The mobile number is not registered on WhatsApp";
    super(`${internalMessage}: ${message}`);
  }
}

export class WhatsappBot {
  private static instance: WhatsappBot;
  private client: Client;
  private authed: boolean = false;
  private readonly puppeteerConfig: {
    headless: boolean;
    executablePath: string;
    args: string[];
  };
  private readonly pathsConfig: {
    qrCodeFile: string;
    lastQrFile: string;
  };

  private constructor() {
    this.puppeteerConfig = whatsappBotConfig.get("puppeteer");
    this.pathsConfig = whatsappBotConfig.get("paths");
    const chromiumPath = findChrome();
    const authPath = path.join(__dirname, "auth");

    if (!fs.existsSync(authPath)) {
      fs.mkdirSync(authPath, { recursive: true });
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: "client-one",
        dataPath: authPath,
      }),
      puppeteer: {
        args: this.puppeteerConfig.args,
        headless: this.puppeteerConfig.headless,
        executablePath:
          process.env.CHROMIUM_PATH ||
          chromiumPath ||
          this.puppeteerConfig.executablePath,
      },
    });

    this.initializeClient();
  }

  public static async getInstance(): Promise<WhatsappBot> {
    if (!WhatsappBot.instance) {
      WhatsappBot.instance = new WhatsappBot();
      await WhatsappBot.instance.waitUntilAuthenticated();
    }

    return WhatsappBot.instance;
  }

  private initializeClient(): void {
    this.client.on("qr", (qrCode) => {
      console.log("QR RECEIVED", qrCode);
      const qrPath = path.join(__dirname, this.pathsConfig.qrCodeFile);
      const qrImage = qr.image(qrCode, { type: "png" });
      qrImage.pipe(fs.createWriteStream(qrPath));
    });

    this.client.on("authenticated", () => {
      console.log("AUTHENTICATED");
      this.authed = true;
      const lastQrPath = path.join(__dirname, this.pathsConfig.lastQrFile);
      if (fs.existsSync(lastQrPath)) {
        try {
          fs.unlinkSync(lastQrPath);
        } catch (error) {
          if (error instanceof Error) {
            throw new WhatsAppBotResponseError(
              `Error: ${JSON.stringify(error.name)} Message: ${error.message}`,
            );
          }
          throw new ClientRequestError(JSON.stringify(error));
        }
      } else {
        console.log("No last QR code found");
      }
    });

    this.client.on("auth_failure", (message) => {
      console.log("AUTHENTICATION FAILURE", message);
      this.authed = false;
    });

    this.client.on("ready", () => {
      console.log("Client is ready");
      this.authed = true;
    });

    this.client.on("disconnected", (reason) => {
      console.log("Client disconnected", reason);
      this.authed = false;
    });

    this.client.initialize();
  }

  private waitUntilAuthenticated(): Promise<void> {
    return new Promise((resolve, _) => {
      const checkAuth = () => {
        if (this.authed) {
          resolve();
        } else {
          setTimeout(checkAuth, 1000);
        }
      };
      checkAuth();
    });
  }

  public async isAuthenticated(): Promise<boolean> {
    return this.authed;
  }

  private formatPhoneNumber(phoneNumber: string, country: CountryCode): string {
    const sanitizedNumber = phoneNumber.replace(/\D/g, "");
    const countryCode = getCountryCallingCode(country);
    const finalNumber = `${countryCode}${sanitizedNumber.substring(sanitizedNumber.length - 11)}`;
    return `${finalNumber}@c.us`;
  }

  public async sendMessage(
    phoneNumber: string,
    country: CountryCode,
    message: string,
  ) {
    const formattedNumber = this.formatPhoneNumber(phoneNumber, country);

    if (await this.isAuthenticated()) {
      try {
        const chats = await this.client.getChats();
        const existingChat = chats.find(
          (chat) => chat.id._serialized === formattedNumber,
        );

        if (existingChat) {
          await existingChat.sendMessage(message);
          console.log(
            "Message sent successfully to existing chat",
            formattedNumber,
          );
        } else {
          const numberDetails = await this.client.getNumberId(formattedNumber);
          if (numberDetails) {
            await this.client.sendMessage(numberDetails._serialized, message);
            console.log("Message sent successfully to", formattedNumber);
          } else {
            throw new NumberNotRegisteredError(
              `Mobile number ${formattedNumber} is not registered`,
            );
          }
        }
      } catch (error) {
        if (error instanceof NumberNotRegisteredError) {
          console.error("Number not registered:", error.message);
        } else {
          throw new ClientRequestError((error as any).message);
        }
      }
    } else {
      console.log("Client is not authenticated.");
    }
  }
}
