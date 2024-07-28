import { userDataMap, userTokens } from "../repository/UserRepository";
import UserService from "../services/UserService";

class UserUseCase {
  public static async getUserData(token: string) {
    return await UserService.getUserData(token);
  }

  public static async isUserLoggedIn(userNumber: string): Promise<any> {
    const cachedUserData = userDataMap.get(userNumber);
    if (cachedUserData) {
      return cachedUserData.data;
    }

    const token = userTokens.get(userNumber);
    if (token) {
      const userData = await this.getUserData(token);
      if (userData) {
        userDataMap.set(userNumber, { token, data: userData });
        return userData;
      } else {
        userTokens.delete(userNumber);
      }
    }
    return null;
  }

  public static async logoutUser(userNumber: string) {
    userTokens.delete(userNumber);
    userDataMap.delete(userNumber);
  }
}

export default UserUseCase;
