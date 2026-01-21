"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.getPropertyReviews = exports.getReviews = exports.createReview = void 0;
const Review_1 = __importDefault(require("../models/Review"));
const Booking_1 = __importDefault(require("../models/Booking"));
const zod_1 = require("zod");
const createReviewSchema = zod_1.z.object({
    propertyId: zod_1.z.string(),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().min(1).max(1000),
});
const createReview = async (req, res) => {
    try {
        if (req.user.role !== "tenant") {
            return res.status(403).json({ message: "Only tenants can create reviews" });
        }
        const validatedData = createReviewSchema.parse(req.body);
        // Check if tenant has a completed booking for this property
        const booking = await Booking_1.default.findOne({
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
        const existingReview = await Review_1.default.findOne({
            tenant: req.user._id,
            property: validatedData.propertyId,
        });
        if (existingReview) {
            return res
                .status(400)
                .json({ message: "You have already reviewed this property" });
        }
        const review = new Review_1.default({
            tenant: req.user._id,
            property: validatedData.propertyId,
            rating: validatedData.rating,
            comment: validatedData.comment,
        });
        await review.save();
        res.status(201).json({ message: "Review created successfully", review });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error("Create review error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createReview = createReview;
const getReviews = async (req, res) => {
    try {
        const { propertyId } = req.query;
        let query = {};
        if (propertyId) {
            query.property = propertyId;
        }
        const reviews = await Review_1.default.find(query)
            .populate("tenant", "name")
            .populate("property", "name")
            .sort({ createdAt: -1 });
        res.json(reviews);
    }
    catch (error) {
        console.error("Get reviews error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getReviews = getReviews;
const getPropertyReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Review_1.default.find({ property: id })
            .populate("tenant", "name")
            .sort({ createdAt: -1 });
        // Calculate average rating
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 5;
        res.json({ reviews, averageRating: avgRating });
    }
    catch (error) {
        console.error("Get property reviews error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getPropertyReviews = getPropertyReviews;
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const review = await Review_1.default.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (review.tenant.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (rating)
            review.rating = rating;
        if (comment)
            review.comment = comment;
        await review.save();
        res.json({ message: "Review updated successfully", review });
    }
    catch (error) {
        console.error("Update review error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review_1.default.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (review.tenant.toString() !== req.user._id.toString() &&
            req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        await Review_1.default.findByIdAndDelete(id);
        res.json({ message: "Review deleted successfully" });
    }
    catch (error) {
        console.error("Delete review error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteReview = deleteReview;
//# sourceMappingURL=reviewController.js.map