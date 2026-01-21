import mongoose, { Schema, Document } from "mongoose";

export interface IComplaint extends Document {
  tenant: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  status: "pending" | "in-progress" | "resolved" | "rejected";
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
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
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IComplaint>("Complaint", ComplaintSchema);


