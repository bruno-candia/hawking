import { Message } from "whatsapp-web.js";

import UserUseCase from "@src/useCase/UserUseCase";

import { sessions } from "../infrastructure/social/whatsapp/whatsappSession";
import RegisterUseCase from "../useCase/RegisterUseCase";

import UserValidationController from "./UserValidationController";

const registrationSteps = new Map<string, number>();
const userRegistrationData = new Map<string, any>();

export { registrationSteps };

export class RegisterController {
  public static async handleRegister(
    sessionId: string,
    message: Message,
  ): Promise<void> {
    const client = sessions.get(sessionId);
    if (!client) {
      throw new Error("Client not available");
    }

    const phone = message.from;
    const currentStep = registrationSteps.get(phone) || 0;

    const userData = await UserUseCase.isUserLoggedIn(phone);
    if (userData) {
      await UserValidationController.handleUserAlreadyLoggedIn(client, phone);
      return;
    }

    if (message.body === "/quit") {
      registrationSteps.delete(phone);
      userRegistrationData.delete(phone);
      await client.sendMessage(
        message.from,
        "🚫 *Processo de registro cancelado.*\n\nSe precisar de ajuda, estarei por aqui!",
      );
      return;
    }

    switch (currentStep) {
      case 0:
        await client.sendMessage(
          message.from,
          "👋 *Bem-vindo ao nosso serviço de registro!*\n\nPara começar, por favor forneça o seu _nome completo_.\n\nSe você quiser desistir do processo, basta digitar /quit.",
        );
        registrationSteps.set(phone, 1);
        break;
      case 1:
        userRegistrationData.set(phone, { name: message.body });
        await client.sendMessage(
          message.from,
          "🔒 *Por favor, crie uma senha segura:*",
        );
        registrationSteps.set(phone, 2);
        break;
      case 2:
        const userData = userRegistrationData.get(phone) || {};
        userData.password = message.body;
        userRegistrationData.set(phone, userData);
        await client.sendMessage(
          message.from,
          "🌍 *Qual é o código do seu país?*\n\nExemplo: _BR_ para Brasil.",
        );
        registrationSteps.set(phone, 3);
        break;
      case 3:
        const finalUserData = userRegistrationData.get(phone);
        finalUserData.countryCode = message.body;
        finalUserData.phone = phone;
        try {
          await RegisterUseCase.execute(finalUserData);
          await client.sendMessage(
            message.from,
            `🎉 *Registro realizado com sucesso!*\n\nSeja bem-vindo, _${finalUserData.name}_! 😊`,
          );
        } catch (error) {
          await client.sendMessage(
            message.from,
            `❌ *Erro ao realizar o registro.*\n\nPor favor, tente novamente mais tarde.\n\n${(error as Error).message}`,
          );
        }
        registrationSteps.delete(phone);
        userRegistrationData.delete(phone);
        break;
      default:
        await client.sendMessage(
          message.from,
          "⚠️ *Erro no processo de registro.*\n\nPor favor, tente novamente.",
        );
        registrationSteps.delete(phone);
        userRegistrationData.delete(phone);
        break;
    }
  }
}
