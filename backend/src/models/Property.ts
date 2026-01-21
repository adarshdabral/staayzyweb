import mongoose, { Schema, Document } from "mongoose";

export interface IProperty extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  nearestCollege: string;
  distanceFromCollege: number; // in km
  facilities: string[];
  images: string[];
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
    },
    nearestCollege: {
      type: String,
      required: [true, "Nearest college is required"],
      trim: true,
    },
    distanceFromCollege: {
      type: Number,
      required: [true, "Distance from college is required"],
      min: [0, "Distance cannot be negative"],
    },
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProperty>("Property", PropertySchema);


