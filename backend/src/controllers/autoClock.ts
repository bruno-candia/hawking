import { Controller, Delete, Get, Middleware, Post } from "@overnightjs/core";
import { Request, Response } from "express";

import { authMiddleware } from "@src/middlewares/authMiddleware";
import { AutoClockUser } from "@src/models/autoClockUser";
import { User } from "@src/models/user";

import { BaseController } from ".";

@Controller("autoclock")
export class AutoClockController extends BaseController {
  @Post("register")
  @Middleware(authMiddleware)
  public async register(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.context?.userId;
      const user = await User.findOne({ _id: userId });

      if (!user || !userId) {
        return this.sendErrorResponse(res, {
          code: 404,
          message: "User not found!",
        });
      }

      const { phone, name, countryCode } = user;

      const existingUser = await AutoClockUser.findOne({ userId });

      if (existingUser) {
        return res
          .status(409)
          .send({ message: "User already registered in auto-clock" });
      }

      const { preferredTimes } = req.body;
      if (!preferredTimes || !preferredTimes.entry || !preferredTimes.exit) {
        return res
          .status(400)
          .send({ message: "Preferred times are required" });
      }

      const userData = {
        userId,
        phone,
        name,
        countryCode,
        autoClockEnabled: true,
        preferredTimes,
      };

      const newUser = new AutoClockUser(userData);
      await newUser.save();
      return res.status(201).send(newUser);
    } catch (error) {
      return res.status(500).send({
        message: "Error registering user in auto-clock",
        error: (error as Error).message,
      });
    }
  }

  @Get("perform/:userId")
  public async perform(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const user = await AutoClockUser.findOne({ userId });

      if (!user) {
        res.status(404).send({ message: "User not found" });
        return;
      }

      res.status(200).send({
        preferredTimes: user.preferredTimes,
      });
    } catch (error) {
      res.status(500).send({
        message: "Error performing auto-clock",
        error: (error as Error).message,
      });
    }
  }

  @Delete("unregister/:userId")
  public async unregister(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const user = await AutoClockUser.findOneAndDelete({ userId });

      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      return res
        .status(200)
        .send({ message: "User unregistered successfully" });
    } catch (error) {
      return res.status(500).send({
        message: "Error unregistering user from auto-clock",
        error: (error as Error).message,
      });
    }
  }
}
