import { Message } from "whatsapp-web.js";

import { userDataMap } from "@src/repository/UserRepository";

import { sessions } from "../infrastructure/social/whatsapp/whatsappSession";
import AutoClockUseCase from "../useCase/AutoClockUseCase";

const autoClockSteps = new Map<string, number>();

export { autoClockSteps };

export class AutoClockController {
  public static async handleAutoClock(
    sessionId: string,
    message: Message,
  ): Promise<void> {
    const client = sessions.get(sessionId);
    if (!client) {
      throw new Error("Client not available");
    }

    const phone = message.from;
    const currentStep = autoClockSteps.get(phone) || 0;

    const userData = userDataMap.get(phone);
    if (!userData) {
      await client.sendMessage(
        phone,
        "⚠️ *Você precisa fazer login primeiro!*\n\nUse o comando _/login <sua senha>_ para fazer login.",
      );
      return;
    }

    if (message.body === "/quit") {
      autoClockSteps.delete(phone);
      await client.sendMessage(
        message.from,
        "🚫 *Processo de registro cancelado.*\n\nSe precisar de ajuda, estarei por aqui!",
      );
      return;
    }

    if (message.body.toLowerCase() === "sim") {
      if (currentStep === 1) {
        try {
          await AutoClockUseCase.registerUser(phone);
          await client.sendMessage(
            phone,
            "Você foi registrado com sucesso no Auto-Clock! ⏰",
          );
        } catch (error) {
          await client.sendMessage(
            phone,
            `Erro ao registrar no Auto-Clock: ${(error as Error).message}`,
          );
        }
        autoClockSteps.delete(phone);
      }
    } else if (message.body.toLowerCase() === "não") {
      await client.sendMessage(
        phone,
        "Ok! Se mudar de ideia, basta enviar /auto-clock novamente.",
      );
      autoClockSteps.delete(phone);
    } else {
      switch (currentStep) {
        case 0:
          await client.sendMessage(
            phone,
            "Você deseja participar do Auto-Clock? Responda com 'Sim' ou 'Não'.",
          );
          autoClockSteps.set(phone, 1);
          break;
        default:
          await client.sendMessage(
            phone,
            "Desculpe, não entendi sua resposta. Por favor, responda com 'Sim' ou 'Não'.",
          );
          break;
      }
    }
  }
}
