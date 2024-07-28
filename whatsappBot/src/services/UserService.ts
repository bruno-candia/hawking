import axios, { AxiosError } from "axios";
import { Client } from "whatsapp-web.js";

import { userTokens } from "../controllers/LoginController";

const API_BASE_URL = "http://localhost:3000";

const userDataMap = new Map<string, { token: string; data: any }>();

export default class UserService {
  public static async createUser(userData: any): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public static async getUserByPhone(phone: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${phone}`);
      return response.data;
    } catch (error) {
      if (
        (error as AxiosError).response &&
        (error as AxiosError).response?.status === 404
      ) {
        return null;
      }
      throw error;
    }
  }
  public static async authenticateUser(credentials: any): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/authenticate`,
        credentials,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public static async getUserData(token: string) {
    try {
      const response = await axios.get("http://localhost:3000/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.user;
    } catch {
      return null;
    }
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
