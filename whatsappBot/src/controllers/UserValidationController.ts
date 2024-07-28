import { Client } from "whatsapp-web.js";

class UserValidationController {
  public static async handleUserAlreadyLoggedIn(
    client: Client,
    userNumber: string,
  ) {
    await client.sendMessage(
      userNumber,
      "⚠️ *Você já está logado!*\n\nPara sair, use o comando _/logout_.",
    );
  }
}

export default UserValidationController;
