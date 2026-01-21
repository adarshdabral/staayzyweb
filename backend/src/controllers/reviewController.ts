import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Review from "../models/Review";
import Booking from "../models/Booking";
import { z } from "zod";

const createReviewSchema = z.object({
  propertyId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Only tenants can create reviews" });
    }

    const validatedData = createReviewSchema.parse(req.body);

    // Check if tenant has a completed booking for this property
    const booking = await Booking.findOne({
      tenant: req.user._id,
      property: validatedData.propertyId,
      status: "completed",
    });

    if (!booking) {
      return res
        .status(400)
        .json({ message: "You must complete a booking before reviewing" });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      tenant: req.user._id,
      property: validatedData.propertyId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this property" });
    }

    const review = new Review({
      tenant: req.user._id,
      property: validatedData.propertyId,
      rating: validatedData.rating,
      comment: validatedData.comment,
    });

    await review.save();

    res.status(201).json({ message: "Review created successfully", review });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Create review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.query;

    let query: any = {};
    if (propertyId) {
      query.property = propertyId;
    }

    const reviews = await Review.find(query)
      .populate("tenant", "name")
      .populate("property", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPropertyReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ property: id })
      .populate("tenant", "name")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 5;

    res.json({ reviews, averageRating: avgRating });
  } catch (error) {
    console.error("Get property reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    res.json({ message: "Review updated successfully", review });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (
      review.tenant.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Review.findByIdAndDelete(id);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


