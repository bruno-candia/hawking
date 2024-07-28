import { CountryCode } from "libphonenumber-js";
import mongoose, { Document, Model } from "mongoose";

import AuthService from "@src/services/authService";

export interface User {
  _id?: string;
  name: string;
  phone: string;
  password: string;
  countryCode: CountryCode;
}

export enum CUSTOM_VALIDATION {
  DUPLICATED = "DUPLICATED",
  NOT_ADMIN = "NOT_ADMIN",
}

interface UserModel extends Omit<User, "_id">, Document {}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    countryCode: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

/**
 * Validates the phoneNumber and throws a validation error, otherwise it will throw a 500
 */
schema.path("phone").validate(
  async (phone: string) => {
    const phoneCount = await mongoose.models.User.countDocuments({ phone });
    return !phoneCount;
  },
  "already exists in the database.",
  CUSTOM_VALIDATION.DUPLICATED,
);

schema.pre<UserModel>("save", async function (): Promise<void> {
  if (!this.password || !this.isModified("password")) {
    return;
  }

  try {
    const hashedPassword = await AuthService.hashPassword(this.password);
    this.password = hashedPassword;
  } catch (err) {
    console.error(`Error hashing the password for the user ${this.phone}`, err);
  }
});
export const User: Model<UserModel> = mongoose.model<UserModel>("User", schema);
