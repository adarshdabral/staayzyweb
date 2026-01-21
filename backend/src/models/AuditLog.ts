import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  admin: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin is required"],
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: [
        "property_approve",
        "property_reject",
        "complaint_resolve",
        "complaint_reject",
        "user_promote",
        "user_demote",
        "user_delete",
        "booking_modify",
      ],
    },
    resource: {
      type: String,
      required: [true, "Resource is required"],
    },
    resourceId: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);


