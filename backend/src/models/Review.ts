import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  property: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tenant is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from same tenant for same property
ReviewSchema.index({ property: 1, tenant: 1 }, { unique: true });

export default mongoose.model<IReview>("Review", ReviewSchema);


