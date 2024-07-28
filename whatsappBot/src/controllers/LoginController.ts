import { Message } from "whatsapp-web.js";

import { userDataMap, userTokens } from "@src/repository/UserRepository";
import UserUseCase from "@src/useCase/UserUseCase";

import { sessions } from "../infrastructure/social/whatsapp/whatsappSession";
import LoginUseCase from "../useCase/LoginUseCase";

import UserValidationController from "./UserValidationController";

export { userTokens };

export class LoginController {
  public static async handleLogin(
    sessionId: string,
    message: Message,
  ): Promise<void> {
    const client = sessions.get(sessionId);
    if (!client) {
      throw new Error("Client not available");
    }

    const commandParts = message.body.split(" ");
    const action = commandParts[0];
    const codeOrPassword = commandParts[1];
    const phone = message.from;

    const userData = await UserUseCase.isUserLoggedIn(phone);
    if (userData) {
      await UserValidationController.handleUserAlreadyLoggedIn(client, phone);
      return;
    }

    if (!codeOrPassword) {
      await client.sendMessage(
        phone,
        "❗ *Por favor, forneça uma senha para fazer login.*\n\nUse o comando: _/login <sua senha>_",
      );
      return;
    }

    try {
      if (action === "/login") {
        const userData = await LoginUseCase.execute(phone, codeOrPassword);
        userTokens.set(phone, userData.token);
        userDataMap.set(phone, { token: userData.token, data: userData });
        await client.sendMessage(
          phone,
          `✅ *LOGIN REALIZADO COM SUCESSO!*\n\nOlá, *${userData.name}*!\n\nPara manter sua segurança, por favor apague esta mensagem contendo sua senha.`,
        );
      }
    } catch (error) {
      await client.sendMessage(
        phone,
        `❌ *Erro ao realizar o login.*\n\n${(error as Error).message}`,
      );
    }
  }
}
