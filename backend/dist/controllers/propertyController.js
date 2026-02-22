"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getProperties = exports.addRoom = exports.createProperty = void 0;
const Property_1 = __importDefault(require("../models/Property"));
const Room_1 = __importDefault(require("../models/Room"));
const zod_1 = require("zod");
/* ──────────────────────────────
   MEDIA SANITIZATION
   Safety: Never allow blob URLs, local URLs, or non-Cloudinary URLs
   into the database. Ensures rendering works and prevents corruption.
────────────────────────────── */
function sanitizeMediaUrls(urls) {
    if (!Array.isArray(urls))
        return [];
    return urls
        .filter((url) => typeof url === "string" && url.trim().length > 0)
        .filter((url) => !url.startsWith("blob:"))
        .filter((url) => url.startsWith("https://"))
        .filter((url) => url.includes("res.cloudinary.com"))
        .filter((url, idx, arr) => arr.indexOf(url) === idx);
}
/* ──────────────────────────────
   VALIDATION SCHEMAS
────────────────────────────── */
const createPropertySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Property name is required"),
    nearestCollege: zod_1.z.string().min(1, "Nearest college is required"),
    distanceFromCollege: zod_1.z.number().min(0),
    facilities: zod_1.z.array(zod_1.z.string()).optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
});
const createRoomSchema = zod_1.z.object({
    roomType: zod_1.z.enum(["single", "sharing"]),
    capacity: zod_1.z.coerce.number().min(1),
    availableCount: zod_1.z.coerce.number().min(0),
    monthlyRent: zod_1.z.coerce.number().min(0),
    securityDeposit: zod_1.z.coerce.number().min(0),
    rules: zod_1.z.array(zod_1.z.string()).optional(),
    allowedGender: zod_1.z.enum(["boys", "girls", "both"]).default("both"),
    occupancyStatus: zod_1.z.enum(["occupied", "vacant"]).default("vacant"),
    occupiedCount: zod_1.z.coerce.number().min(0).default(0),
    vacantCount: zod_1.z.coerce.number().min(0).default(0),
});
/* ──────────────────────────────
   CREATE PROPERTY
────────────────────────────── */
const createProperty = async (req, res) => {
    try {
        const validated = createPropertySchema.parse(req.body);
        const sanitizedImages = sanitizeMediaUrls(validated.images || []);
        const property = await Property_1.default.create({
            ...validated,
            images: sanitizedImages,
            owner: req.user._id,
            status: "pending",
        });
        res.status(201).json({
            message: "Property created successfully",
            property,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error("Create property error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createProperty = createProperty;
/* ──────────────────────────────
   ADD ROOM
────────────────────────────── */
const addRoom = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const validated = createRoomSchema.parse(req.body);
        const property = await Property_1.default.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        if (property.owner.toString() !== req.user._id.toString() &&
            req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        const room = await Room_1.default.create({
            ...validated,
            property: propertyId,
        });
        res.status(201).json({
            message: "Room added successfully",
            room,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error("Add room error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.addRoom = addRoom;
/* ──────────────────────────────
   GET PROPERTIES (FULLY FIXED)
────────────────────────────── */
const getProperties = async (req, res) => {
    try {
        const { status, owner, nearestCollege, minRent, maxRent, facilities, distance, } = req.query;
        const query = {};
        /* ───────── VISIBILITY RULES ───────── */
        if (!req.user) {
            // Public users
            query.status = "approved";
        }
        else if (req.user.role === "owner") {
            query.owner = req.user._id;
            if (status)
                query.status = status;
        }
        else if (req.user.role === "admin") {
            if (status)
                query.status = status;
        }
        /* ───────── OWNER FILTER ───────── */
        if (owner === "me") {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            query.owner = req.user._id;
        }
        else if (owner) {
            query.owner = owner;
        }
        /* ───────── SEARCH FILTERS ───────── */
        if (nearestCollege) {
            query.nearestCollege = { $regex: nearestCollege, $options: "i" };
        }
        if (distance) {
            query.distanceFromCollege = { $lte: Number(distance) };
        }
        if (facilities) {
            const facilitiesArray = Array.isArray(facilities)
                ? facilities
                : [facilities];
            query.facilities = { $in: facilitiesArray };
        }
        /* ───────── FETCH PROPERTIES ───────── */
        let properties = await Property_1.default.find(query)
            .populate("owner", "name email phone")
            .sort({ createdAt: -1 });
        /* ───────── RENT FILTER (ROOMS) ───────── */
        if (minRent || maxRent) {
            const propertyIds = await Room_1.default.find({
                monthlyRent: {
                    ...(minRent && { $gte: Number(minRent) }),
                    ...(maxRent && { $lte: Number(maxRent) }),
                },
            }).distinct("property");
            properties = properties.filter((p) => propertyIds.some((id) => id.toString() === p._id.toString()));
        }
        /* ───────── POPULATE ROOMS ───────── */
        const result = await Promise.all(properties.map(async (property) => {
            const rooms = await Room_1.default.find({ property: property._id });
            return {
                ...property.toObject(),
                rooms,
            };
        }));
        res.json(result);
    }
    catch (error) {
        console.error("Get properties error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProperties = getProperties;
/* ──────────────────────────────
   GET PROPERTY BY ID
────────────────────────────── */
const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property_1.default.findById(id).populate("owner", "name email phone");
        if (!property) {
            return res.status(404).json({ message: "Property not found", error: "not_found" });
        }
        // If property is not approved/available, do NOT return 403. The property
        // detail page is public; return the property data and mark it as unavailable.
        const isAvailable = property.status === "approved";
        const rooms = await Room_1.default.find({ property: id });
        if (!isAvailable) {
            // Return 200 with availability flag and the property payload under `property`.
            return res.json({
                available: false,
                property: {
                    ...property.toObject(),
                    rooms,
                },
            });
        }
        // Available property — return same shape as before for backward compatibility
        res.json({
            ...property.toObject(),
            rooms,
        });
    }
    catch (error) {
        console.error("Get property error:", error);
        const errMsg = error?.message || "Server error";
        res.status(500).json({ message: "Server error", error: errMsg });
    }
};
exports.getPropertyById = getPropertyById;
/* ──────────────────────────────
   UPDATE PROPERTY
────────────────────────────── */
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        // Accept either the old `images` array or the newer `existingImages` + `newImages`
        const body = req.body || {};
        const validated = createPropertySchema.partial().parse(body);
        const property = await Property_1.default.findById(id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        if (property.owner.toString() !== req.user._id.toString() &&
            req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        // Merge images from any supported format, then sanitize (never trust client)
        let merged = [];
        if (Array.isArray(body.images)) {
            merged = body.images;
        }
        else if (Array.isArray(body.existingImages) || Array.isArray(body.newImages)) {
            const existing = Array.isArray(body.existingImages) ? body.existingImages : [];
            const newUrls = Array.isArray(body.newImages) ? body.newImages : [];
            merged = [...existing, ...newUrls];
        }
        else if (Array.isArray(validated.images)) {
            merged = validated.images;
        }
        if (merged.length > 0 || body.images !== undefined || body.existingImages !== undefined || body.newImages !== undefined) {
            validated.images = sanitizeMediaUrls(merged);
        }
        // Apply core property updates
        Object.assign(property, validated);
        await property.save();
        // If rooms were supplied in the body, replace existing rooms for this property.
        if (Array.isArray(body.rooms)) {
            // Validate each room against schema
            const roomsData = body.rooms;
            // Remove existing rooms
            await Room_1.default.deleteMany({ property: id });
            // Recreate rooms
            for (const r of roomsData) {
                try {
                    const validatedRoom = createRoomSchema.parse(r);
                    const { _id, ...roomData } = validatedRoom;
                    await Room_1.default.create({ ...roomData, property: id });
                }
                catch (roomErr) {
                    // log and continue — invalid room data should not break the whole update
                    console.warn("Invalid room data skipped during update:", roomErr);
                }
            }
        }
        // Reload property with rooms
        const rooms = await Room_1.default.find({ property: property._id });
        const result = { ...property.toObject(), rooms };
        res.json({
            message: "Property updated successfully",
            property: result,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error("Update property error:", error);
        const errMsg = error?.message || "Server error";
        res.status(500).json({ message: "Failed to update property", error: errMsg });
    }
};
exports.updateProperty = updateProperty;
/* ──────────────────────────────
   DELETE PROPERTY
────────────────────────────── */
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property_1.default.findById(id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        if (property.owner.toString() !== req.user._id.toString() &&
            req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        await Room_1.default.deleteMany({ property: id });
        await Property_1.default.findByIdAndDelete(id);
        res.json({ message: "Property deleted successfully" });
    }
    catch (error) {
        console.error("Delete property error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteProperty = deleteProperty;
//# sourceMappingURL=propertyController.js.map