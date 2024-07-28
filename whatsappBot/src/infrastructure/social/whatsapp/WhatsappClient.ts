import { MessageRouter } from "../../../routes/messageRouter";

import { restoreSessions, sessions, setupSession } from "./whatsappSession";

class WhatsappClient {
  public async initialize() {
    console.log("Restoring sessions...");
    restoreSessions();

    const newSession = setupSession("new-session-id");
    if (newSession.success) {
      console.log("New session created successfully.");
    } else {
      console.error("Failed to create new session:", newSession.message);
    }

    // Inicializando eventos de mensagens
    sessions.forEach((client, sessionId) => {
      client.on("message", async (msg) => {
        try {
          await MessageRouter.routeMessage(sessionId, msg);
        } catch (error) {
          console.error("Error handling message:", error);
        }
      });
    });
  }
}

export default new WhatsappClient();
