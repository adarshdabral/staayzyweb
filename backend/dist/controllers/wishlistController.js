"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromWishlist = exports.getWishlist = exports.addToWishlist = void 0;
const Wishlist_1 = __importDefault(require("../models/Wishlist"));
const Property_1 = __importDefault(require("../models/Property"));
const addToWishlist = async (req, res) => {
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
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.status !== "approved") {
            return res.status(400).json({ message: "Property not available" });
        }
        // Check if already in wishlist
        const existing = await Wishlist_1.default.findOne({
            tenant: req.user._id,
            property: propertyId,
        });
        if (existing) {
            return res.status(400).json({ message: "Already in wishlist" });
        }
        const wishlist = new Wishlist_1.default({
            tenant: req.user._id,
            property: propertyId,
        });
        await wishlist.save();
        res.status(201).json({ message: "Added to wishlist", wishlist });
    }
    catch (error) {
        console.error("Add to wishlist error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.addToWishlist = addToWishlist;
const getWishlist = async (req, res) => {
    try {
        if (req.user.role !== "tenant") {
            return res
                .status(403)
                .json({ message: "Only tenants can view wishlist" });
        }
        const wishlist = await Wishlist_1.default.find({ tenant: req.user._id })
            .populate({
            path: "property",
            populate: { path: "owner", select: "name email phone" },
        })
            .sort({ createdAt: -1 });
        res.json(wishlist);
    }
    catch (error) {
        console.error("Get wishlist error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getWishlist = getWishlist;
const removeFromWishlist = async (req, res) => {
    try {
        if (req.user.role !== "tenant") {
            return res
                .status(403)
                .json({ message: "Only tenants can modify wishlist" });
        }
        const { id } = req.params;
        const wishlist = await Wishlist_1.default.findById(id);
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist item not found" });
        }
        if (wishlist.tenant.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }
        await Wishlist_1.default.findByIdAndDelete(id);
        res.json({ message: "Removed from wishlist" });
    }
    catch (error) {
        console.error("Remove from wishlist error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.removeFromWishlist = removeFromWishlist;
//# sourceMappingURL=wishlistController.js.map