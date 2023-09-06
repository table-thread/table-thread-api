import { model, Schema, Document } from 'mongoose';
import { Otp } from '@interfaces/otps.interface';

const otpSchema: Schema = new Schema(
  {
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 5 * 60 });

const otpModel = model<Otp & Document>('Otp', otpSchema);

export default otpModel;
