import axios, { AxiosError } from "axios";

class AutoClockService {
  public static async registerUserInAutoClock(userData: any): Promise<any> {
    try {
      const response = await axios.post(
        `${process.env.API_BASE_URL}/auto-clock/register`,
        userData,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Error registering user in auto-clock: ${(error as AxiosError).message}`,
      );
    }
  }

  public static async performAutoClock(_: any): Promise<any> {
    // Mock request to backend for performing auto-clock
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
}

export default AutoClockService;
