import { Message } from "whatsapp-web.js";

import { sessions } from "../infrastructure/social/whatsapp/whatsappSession";
import UserUseCase from "../useCase/UserUseCase";

export class LogoutController {
  public static async handleLogout(
    sessionId: string,
    message: Message,
  ): Promise<void> {
    const client = sessions.get(sessionId);
    if (!client) {
      throw new Error("Client not available");
    }

    const userNumber = message.from;
    const userData = await UserUseCase.isUserLoggedIn(userNumber);

    if (!userData) {
      await client.sendMessage(
        userNumber,
        "⚠️ *Você não está logado.*\n\nPara fazer login, use o comando _/login <sua senha>_.",
      );
      return;
    }

    await UserUseCase.logoutUser(userNumber);
    await client.sendMessage(
      userNumber,
      "✅ *Logout realizado com sucesso!*\n\nEsperamos vê-lo novamente em breve.",
    );
  }
}
