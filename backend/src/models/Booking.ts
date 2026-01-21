import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  tenant: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  rent: number;
  securityDeposit: number;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tenant is required"],
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
    },
    rent: {
      type: Number,
      required: [true, "Rent is required"],
      min: [0, "Rent cannot be negative"],
    },
    securityDeposit: {
      type: Number,
      required: [true, "Security deposit is required"],
      min: [0, "Security deposit cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent overbooking: Decrease available count when booking is approved
BookingSchema.post("findOneAndUpdate", async function (doc: IBooking) {
  if (doc && doc.status === "approved") {
    const Room = mongoose.model("Room");
    await Room.findByIdAndUpdate(doc.room, { $inc: { availableCount: -1 } });
  }
  if (doc && doc.status === "cancelled") {
    const Room = mongoose.model("Room");
    const booking = await mongoose.model("Booking").findById(doc._id);
    if (booking && booking.status === "approved") {
      await Room.findByIdAndUpdate(doc.room, { $inc: { availableCount: 1 } });
    }
  }
});

export default mongoose.model<IBooking>("Booking", BookingSchema);


