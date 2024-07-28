import UserService from "@src/services/UserService";

export default class GetUserUseCase {
  public static async execute(token: string): Promise<any> {
    const userData = await UserService.getUserData(token);
    return userData;
  }
}
