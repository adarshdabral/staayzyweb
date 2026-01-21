"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaintStatus = exports.getComplaintById = exports.getComplaints = exports.createComplaint = void 0;
const Complaint_1 = __importDefault(require("../models/Complaint"));
const zod_1 = require("zod");
const createComplaintSchema = zod_1.z.object({
    propertyId: zod_1.z.string(),
    subject: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().min(1).max(2000),
});
const createComplaint = async (req, res) => {
    try {
        if (req.user.role !== "tenant") {
            return res
                .status(403)
                .json({ message: "Only tenants can file complaints" });
        }
        const validatedData = createComplaintSchema.parse(req.body);
        const complaint = new Complaint_1.default({
            tenant: req.user._id,
            property: validatedData.propertyId,
            subject: validatedData.subject,
            description: validatedData.description,
            status: "pending",
        });
        await complaint.save();
        res
            .status(201)
            .json({ message: "Complaint filed successfully", complaint });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error("Create complaint error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createComplaint = createComplaint;
const getComplaints = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === "tenant") {
            query.tenant = req.user._id;
        }
        else if (req.user.role === "owner") {
            const Property = (await Promise.resolve().then(() => __importStar(require("../models/Property")))).default;
            const properties = await Property.find({ owner: req.user._id });
            query.property = { $in: properties.map((p) => p._id) };
        }
        // Admin can see all complaints
        const complaints = await Complaint_1.default.find(query)
            .populate("tenant", "name email phone")
            .populate("property", "name owner")
            .sort({ createdAt: -1 });
        res.json(complaints);
    }
    catch (error) {
        console.error("Get complaints error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getComplaints = getComplaints;
const getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint_1.default.findById(id)
            .populate("tenant", "name email phone")
            .populate("property");
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        // Check access
        if (req.user.role === "tenant") {
            if (complaint.tenant._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
        }
        else if (req.user.role === "owner") {
            const Property = (await Promise.resolve().then(() => __importStar(require("../models/Property")))).default;
            const property = await Property.findById(complaint.property);
            if (!property) {
                return res.status(404).json({ message: "Property not found" });
            }
            if (property.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
        }
        res.json(complaint);
    }
    catch (error) {
        console.error("Get complaint error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getComplaintById = getComplaintById;
const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        if (!["pending", "in-progress", "resolved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can update status" });
        }
        const complaint = await Complaint_1.default.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        complaint.status = status;
        if (adminNotes)
            complaint.adminNotes = adminNotes;
        await complaint.save();
        res.json({ message: "Complaint status updated", complaint });
    }
    catch (error) {
        console.error("Update complaint error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateComplaintStatus = updateComplaintStatus;
//# sourceMappingURL=complaintController.js.map