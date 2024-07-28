import UserService from "../services/UserService";

class RegisterUseCase {
  public static async execute(userData: any): Promise<any> {
    const existingUser = await UserService.getUserByPhone(userData.phone);
    if (existingUser) {
      throw new Error("User already exists");
    }

    return await UserService.createUser(userData);
  }
}

export default RegisterUseCase;
