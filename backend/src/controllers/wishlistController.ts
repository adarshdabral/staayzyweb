import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Wishlist from "../models/Wishlist";
import Property from "../models/Property";

export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "tenant") {
      return res
        .status(403)
        .json({ message: "Only tenants can use wishlist" });
    }

    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const property = await Property.findById(propertyId);
    if (!property || property.status !== "approved") {
      return res.status(400).json({ message: "Property not available" });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      tenant: req.user._id,
      property: propertyId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    const wishlist = new Wishlist({
      tenant: req.user._id,
      property: propertyId,
    });

    await wishlist.save();

    res.status(201).json({ message: "Added to wishlist", wishlist });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "tenant") {
      return res
        .status(403)
        .json({ message: "Only tenants can view wishlist" });
    }

    const wishlist = await Wishlist.find({ tenant: req.user._id })
      .populate({
        path: "property",
        populate: { path: "owner", select: "name email phone" },
      })
      .sort({ createdAt: -1 });

    res.json(wishlist);
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "tenant") {
      return res
        .status(403)
        .json({ message: "Only tenants can modify wishlist" });
    }

    const { id } = req.params;

    const wishlist = await Wishlist.findById(id);

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    if (wishlist.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Wishlist.findByIdAndDelete(id);

    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


