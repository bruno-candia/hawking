import { Controller, Get, Middleware, Post } from "@overnightjs/core";
import { Request, Response } from "express";

import { authMiddleware } from "@src/middlewares/authMiddleware";
import { User } from "@src/models/user";
import AuthService from "@src/services/authService";

import { BaseController } from "./index";

@Controller("users")
export class UsersController extends BaseController {
  @Post("")
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newUser = await user.save();
      res.status(201).send(newUser);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error);
    }
  }

  @Post("authenticate")
  public async authenticate(req: Request, res: Response): Promise<Response> {
    const user = await User.findOne({ phone: req.body.phone });
    if (!user) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: "User not found!",
        description: "Try verifying your phone address.",
      });
    }
    if (
      !(await AuthService.comparePasswords(req.body.password, user.password))
    ) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: "Password does not match!",
      });
    }
    const token = AuthService.generateToken(user.id);

    return res.send({ ...user.toJSON(), ...{ token } });
  }

  @Get("me")
  @Middleware(authMiddleware)
  public async me(req: Request, res: Response): Promise<Response> {
    const userId = req.context?.userId;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return this.sendErrorResponse(res, {
        code: 404,
        message: "User not found!",
      });
    }

    return res.send({ user });
  }

  @Get(":phone")
  @Middleware(authMiddleware)
  public async getUserByPhone(req: Request, res: Response): Promise<Response> {
    const { phone } = req.params;
    const user = await User.findOne({ phone });
    if (!user) {
      return this.sendErrorResponse(res, {
        code: 404,
        message: "User not found!",
      });
    }
    return res.status(200).send(user);
  }
}
