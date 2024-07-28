import { Client, Message as WhatsAppMessage } from "whatsapp-web.js";

import {
  AutoClockController,
  autoClockSteps,
} from "../controllers/AutoClockController";
import { LoginController } from "../controllers/LoginController";
import { LogoutController } from "../controllers/LogoutController";
import {
  RegisterController,
  registrationSteps,
} from "../controllers/RegisterController";
import { sessions } from "../infrastructure/social/whatsapp/whatsappSession";
import {
  userDataMap,
  userFirstInteraction,
} from "../repository/UserRepository";

export class MessageRouter {
  public static async routeMessage(
    sessionId: string,
    message: WhatsAppMessage,
  ): Promise<void> {
    if (!sessions.has(sessionId)) {
      throw new Error("Session not found");
    }

    const client = sessions.get(sessionId);
    const phone = message.from;

    if (!userFirstInteraction.has(phone)) {
      userFirstInteraction.set(phone, true);
      await (client as Client).sendMessage(
        phone,
        "👋 *Bem-vindo ao nosso serviço!*\n\n*Descrição do Projeto:*\nEste é um projeto para gerenciar seu tempo de trabalho via WhatsApp. Você pode se registrar, fazer login, logout e obter ajuda usando os comandos apropriados.\n\n*Opções Disponíveis:*\n1. /login - Fazer login\n2. /register - Registrar-se\n3. /logout - Fazer logout\n4. /help - Obter ajuda",
      );
      return;
    }

    const command = message.body.split(" ")[0];

    if (command === "/login") {
      await LoginController.handleLogin(sessionId, message);
    } else if (command === "/register" || registrationSteps.has(message.from)) {
      await RegisterController.handleRegister(sessionId, message);
    } else if (command === "/logout") {
      await LogoutController.handleLogout(sessionId, message);
    } else if (
      message.body.startsWith("/auto-clock") ||
      autoClockSteps.has(message.from)
    ) {
      await AutoClockController.handleAutoClock(sessionId, message);
    } else {
      const userData = userDataMap.get(phone);
      if (userData) {
        await (client as Client).sendMessage(
          message.from,
          "⚠️ Comando não reconhecido. Por favor, use /help para ver a lista de comandos disponíveis.",
        );
      } else {
        await (client as Client).sendMessage(
          message.from,
          "⚠️ *Comando não reconhecido.*\n\nPor favor, faça login primeiro usando o comando _/login <sua senha>_.\n\nSe você ainda não tem uma conta, use o comando _/register_ para se registrar.",
        );
      }
    }
  }
}
