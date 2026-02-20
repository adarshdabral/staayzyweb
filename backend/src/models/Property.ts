import mongoose, { Schema, Document } from "mongoose";

export interface IRoom {
  roomType: "single" | "sharing";
  capacity: number;
  availableCount: number;
  monthlyRent: number;
  securityDeposit: number;
  rules: string[];

  // 🆕 NEW FIELDS
  allowedGender: "boys" | "girls" | "both";
  occupancyStatus: "occupied" | "vacant";
  occupiedCount: number;
  vacantCount: number;
}

export interface IProperty extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  nearestCollege: string;
  distanceFromCollege: number;
  facilities: string[];
  images: string[];

  // 🆕 EMBEDDED ROOMS
  rooms: IRoom[];

  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ================= ROOM SUB-SCHEMA ================= */

const RoomSchema = new Schema<IRoom>(
  {
    roomType: {
      type: String,
      enum: ["single", "sharing"],
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    availableCount: {
      type: Number,
      required: true,
      min: 0,
    },

    monthlyRent: {
      type: Number,
      required: true,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },

    rules: [
      {
        type: String,
        trim: true,
      },
    ],

    // 🔥 NEW FIELDS

    allowedGender: {
      type: String,
      enum: ["boys", "girls", "both"],
      default: "both",
      required: true,
    },

    occupancyStatus: {
      type: String,
      enum: ["occupied", "vacant"],
      default: "vacant",
    },

    occupiedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    vacantCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false } // embedded → no separate _id needed
);

/* ================= PROPERTY SCHEMA ================= */

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

    // 🆕 ROOMS ARRAY
    rooms: [RoomSchema],

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