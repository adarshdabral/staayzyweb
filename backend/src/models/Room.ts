import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  property: mongoose.Types.ObjectId;
  roomType: "single" | "sharing";
  capacity: number;
  availableCount: number;
  monthlyRent: number;
  securityDeposit: number;
  rules: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
    },
    roomType: {
      type: String,
      enum: ["single", "sharing"],
      required: [true, "Room type is required"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    availableCount: {
      type: Number,
      required: [true, "Available count is required"],
      min: [0, "Available count cannot be negative"],
      validate: {
        validator: function (this: IRoom) {
          return this.availableCount <= this.capacity;
        },
        message: "Available count cannot exceed capacity",
      },
    },
    monthlyRent: {
      type: Number,
      required: [true, "Monthly rent is required"],
      min: [0, "Monthly rent cannot be negative"],
    },
    securityDeposit: {
      type: Number,
      required: [true, "Security deposit is required"],
      min: [0, "Security deposit cannot be negative"],
    },
    rules: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRoom>("Room", RoomSchema);


