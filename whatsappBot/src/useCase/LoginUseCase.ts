import UserService from "@src/services/UserService";

export default class LoginUseCase {
  public static async execute(phone: string, password: string): Promise<any> {
    const credentials = { phone, password };
    const userData = await UserService.authenticateUser(credentials);
    return userData;
  }
}
