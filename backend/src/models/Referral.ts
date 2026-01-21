import mongoose, { Schema, Document } from "mongoose";

export interface IReferral extends Document {
  referrer: mongoose.Types.ObjectId;
  referred: mongoose.Types.ObjectId;
  referralCode: string;
  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Referrer is required"],
    },
    referred: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Referred user is required"],
    },
    referralCode: {
      type: String,
      required: [true, "Referral code is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IReferral>("Referral", ReferralSchema);


