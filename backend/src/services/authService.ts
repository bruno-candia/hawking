import bcrypt from "bcrypt";
import config from "config";
import jwt from "jsonwebtoken";

export interface JwtToken {
  sub: string;
  iat: number;
  exp: number;
}

export default class AuthService {
  public static async hashPassword(
    password: string,
    salt = 10,
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  public static async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public static generateToken(payload: JwtToken): string {
    const secretKey = config.get<string>("App.auth.key");
    return jwt.sign({ sub: payload }, secretKey, {
      algorithm: "HS256",
      expiresIn: parseInt(config.get("App.auth.tokenExpiresIn")),
    });
  }

  public static decodeToken(token: string): JwtToken {
    const secretKey = config.get<string>("App.auth.key");
    const decoded = jwt.verify(token, secretKey) as JwtToken;
    return decoded;
  }
}
