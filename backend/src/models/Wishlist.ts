import mongoose, { Schema, Document } from "mongoose";

export interface IWishlist extends Document {
  tenant: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
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
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate wishlist entries
WishlistSchema.index({ tenant: 1, property: 1 }, { unique: true });

export default mongoose.model<IWishlist>("Wishlist", WishlistSchema);


