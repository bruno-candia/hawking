import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITimeRange {
  start: string; // formato: "HH:mm"
  end: string; // formato: "HH:mm"
}

export interface IAutoClockUser extends Document {
  userId: string;
  phone: string;
  name: string;
  countryCode: string;
  autoClockEnabled: boolean;
  preferredTimes: {
    entry: ITimeRange;
    exit: {
      mondayToThursday: ITimeRange;
      friday: ITimeRange;
    };
  };
}

const TimeRangeSchema: Schema = new Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false },
);

const PreferredTimesSchema: Schema = new Schema(
  {
    entry: { type: TimeRangeSchema, required: true },
    exit: {
      mondayToThursday: { type: TimeRangeSchema, required: true },
      friday: { type: TimeRangeSchema, required: true },
    },
  },
  { _id: false },
);

const AutoClockUserSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    name: { type: String, required: true },
    countryCode: { type: String, required: true },
    autoClockEnabled: { type: Boolean, default: true },
    preferredTimes: { type: PreferredTimesSchema, required: true },
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

export const AutoClockUser: Model<IAutoClockUser> =
  mongoose.model<IAutoClockUser>("AutoClockUser", AutoClockUserSchema);
