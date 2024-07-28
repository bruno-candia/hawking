import { userDataMap } from "@src/repository/UserRepository";

import AutoClockService from "../services/AutoClockService";

class AutoClockUseCase {
  public static async registerUser(phone: string): Promise<any> {
    const userData = userDataMap.get(phone);
    if (!userData) {
      throw new Error("User not found");
    }
    return await AutoClockService.registerUserInAutoClock(userData.data);
  }

  public static async performAutoClock(phone: string): Promise<any> {
    const userData = userDataMap.get(phone);
    if (!userData) {
      throw new Error("User not found");
    }
    return await AutoClockService.performAutoClock(userData.data);
  }
}

export default AutoClockUseCase;
