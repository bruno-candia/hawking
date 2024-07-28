import fs from "fs";
import path from "path";

import { Client as BaseClient, LocalAuth, WAState } from "whatsapp-web.js";

import { findChrome } from "../../../util/chrome-finder";

class Client extends BaseClient {
  qr?: string;
}

const sessions = new Map<string, Client>();
const sessionFolderPath = path.resolve(__dirname, "../../../sessions");

export { sessions };

export const validateSession = async (sessionId: string) => {
  try {
    const returnData: {
      success: boolean;
      state: WAState | null;
      message: string;
    } = {
      success: false,
      state: null,
      message: "",
    };

    if (!sessions.has(sessionId) || !sessions.get(sessionId)) {
      returnData.message = "session_not_found";
      return returnData;
    }

    const client = sessions.get(sessionId);
    if (!client) return returnData;

    const state = await client.getState();
    returnData.state = state;
    if (state !== WAState.CONNECTED) {
      returnData.message = "session_not_connected";
      return returnData;
    }

    returnData.success = true;
    returnData.message = "session_connected";
    return returnData;
  } catch (error) {
    console.error(error);
    return { success: false, state: null, message: (error as Error).message };
  }
};

// Função para restaurar sessões
export const restoreSessions = () => {
  try {
    if (!fs.existsSync(sessionFolderPath)) {
      fs.mkdirSync(sessionFolderPath, { recursive: true });
    }

    fs.readdir(sessionFolderPath, (_, files) => {
      for (const file of files) {
        const match = file.match(/^session-(.+)$/);
        if (match) {
          const sessionId = match[1];
          console.log("Existing session detected:", sessionId);
          setupSession(sessionId);
        }
      }
    });
  } catch (error) {
    console.error("Failed to restore sessions:", error);
  }
};

// Função para configurar uma sessão
export const setupSession = (sessionId: string) => {
  try {
    if (sessions.has(sessionId)) {
      return {
        success: false,
        message: `Session already exists for: ${sessionId}`,
        client: sessions.get(sessionId),
      };
    }

    const SESSION_FILE_PATH = path.join(
      sessionFolderPath,
      `session-${sessionId}`,
    );

    if (!fs.existsSync(SESSION_FILE_PATH)) {
      fs.mkdirSync(SESSION_FILE_PATH, { recursive: true });
    }

    const localAuth = new LocalAuth({
      clientId: sessionId,
      dataPath: sessionFolderPath,
    });
    const client = new Client({
      authStrategy: localAuth,
      puppeteer: {
        headless: true,
        executablePath: process.env.CHROMIUM_PATH || findChrome(),
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--disable-dev-shm-usage",
        ],
      },
    });

    client
      .initialize()
      .then(() => {
        console.log(`Session ${sessionId} initialized successfully`);
      })
      .catch((err) => {
        console.error("Initialize error:", err.message);
      });
    initializeEvents(client, sessionId);
    sessions.set(sessionId, client);
    return { success: true, message: "Session initiated successfully", client };
  } catch (error) {
    return { success: false, message: (error as Error).message, client: null };
  }
};

const initializeEvents = (client: Client, _: string) => {
  client.on("auth_failure", (msg) => {
    console.error("AUTHENTICATION FAILURE", msg);
  });

  client.on("authenticated", () => {
    console.log("AUTHENTICATED");
  });

  client.on("ready", () => {
    console.log("READY");
  });

  client.on("disconnected", (reason) => {
    console.error("Client disconnected", reason);
  });

  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    client.qr = qr;
  });
};

export const killPuppeteerProcesses = async () => {
  for (const client of sessions.values()) {
    if (client.pupBrowser && client.pupBrowser.process()) {
      const browserProcess = client.pupBrowser.process();
      if (browserProcess) {
        console.log(
          `Killing Puppeteer process with PID: ${browserProcess.pid}`,
        );
        browserProcess.kill("SIGKILL");
      }
    }
  }
};

// Listen for process exit events and kill Puppeteer processes
const handleExit = async (signal: NodeJS.Signals | number) => {
  console.log(`Received signal to terminate: ${signal}`);
  await killPuppeteerProcesses();
  process.exit(signal as number);
};

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
process.on("exit", handleExit);
