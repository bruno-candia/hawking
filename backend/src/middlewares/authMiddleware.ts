import { NextFunction, Request, Response } from "express";

import AuthService from "@src/services/authService";

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction,
): void {
  const authorizationHeader = req.headers?.["authorization"];
  if (!authorizationHeader) {
    res
      .status?.(401)
      .send({ code: 401, error: "Authorization header missing" });
    return;
  }

  const token = authorizationHeader.split(" ")[1];
  try {
    const claims = AuthService.decodeToken(token);
    req.context = { userId: claims.sub };
    next();
  } catch (err) {
    if (err instanceof Error) {
      res.status?.(401).send({ code: 401, error: err.message });
    } else {
      res.status?.(401).send({ code: 401, error: "Unknown auth error" });
    }
  }
}
