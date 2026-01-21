"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.getAllUsers = exports.deleteUser = exports.updateUserRole = exports.updateComplaintStatus = exports.getAllComplaints = exports.getPendingProperties = exports.rejectProperty = exports.approveProperty = exports.getDashboardStats = void 0;
const Property_1 = __importDefault(require("../models/Property"));
const Complaint_1 = __importDefault(require("../models/Complaint"));
const User_1 = __importDefault(require("../models/User"));
const Booking_1 = __importDefault(require("../models/Booking"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const zod_1 = require("zod");
const getDashboardStats = async (req, res) => {
    try {
        const totalListings = await Property_1.default.countDocuments();
        const totalBookings = await Booking_1.default.countDocuments();
        const totalUsers = await User_1.default.countDocuments();
        // Calculate revenue (sum of all approved bookings' rent)
        const bookings = await Booking_1.default.find({ status: "approved" });
        const totalRevenue = bookings.reduce((sum, b) => sum + b.rent, 0);
        // Pending approvals
        const pendingProperties = await Property_1.default.countDocuments({
            status: "pending",
        });
        // Pending complaints
        const pendingComplaints = await Complaint_1.default.countDocuments({
            status: "pending",
        });
        res.json({
            totalListings,
            totalBookings,
            totalRevenue,
            totalUsers,
            pendingProperties,
            pendingComplaints,
        });
    }
    catch (error) {
        console.error("Get dashboard stats error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getDashboardStats = getDashboardStats;
const approveProperty = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate property existence
        const property = await Property_1.default.findById(id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        // Prevent invalid state transition
        if (property.status === "approved") {
            return res.status(400).json({ message: "Property already approved" });
        }
        property.status = "approved";
        await property.save();
        // Log audit
        await AuditLog_1.default.create({
            admin: req.user._id,
            action: "property_approve",
            resource: "Property",
            resourceId: id,
            details: { propertyId: id, status: "approved" },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        res.json({ message: "Property approved", property });
    }
    catch (error) {
        console.error("Approve property error:", error);
        res.status(500).json({ message: "Failed to approve property", error: error.message });
    }
};
exports.approveProperty = approveProperty;
const rejectProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        const property = await Property_1.default.findById(id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        // Prevent invalid state transition
        if (property.status === "rejected") {
            return res.status(400).json({ message: "Property already rejected" });
        }
        property.status = "rejected";
        if (rejectionReason) {
            property.rejectionReason = rejectionReason;
        }
        await property.save();
        // Log audit
        await AuditLog_1.default.create({
            admin: req.user._id,
            action: "property_reject",
            resource: "Property",
            resourceId: id,
            details: { propertyId: id, status: "rejected", reason: rejectionReason },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        res.json({ message: "Property rejected", property });
    }
    catch (error) {
        console.error("Reject property error:", error);
        res.status(500).json({ message: "Failed to reject property", error: error.message });
    }
};
exports.rejectProperty = rejectProperty;
const getPendingProperties = async (req, res) => {
    try {
        const properties = await Property_1.default.find({ status: "pending" })
            .populate("owner", "name email phone")
            .sort({ createdAt: -1 });
        res.json(properties);
    }
    catch (error) {
        console.error("Get pending properties error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getPendingProperties = getPendingProperties;
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint_1.default.find()
            .populate("tenant", "name email phone")
            .populate("property", "name owner")
            .sort({ createdAt: -1 });
        res.json(complaints);
    }
    catch (error) {
        console.error("Get all complaints error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAllComplaints = getAllComplaints;
const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        if (!["pending", "in-progress", "resolved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const complaint = await Complaint_1.default.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        complaint.status = status;
        if (adminNotes)
            complaint.adminNotes = adminNotes;
        await complaint.save();
        // Log audit
        await AuditLog_1.default.create({
            admin: req.user._id,
            action: status === "resolved" ? "complaint_resolve" : "complaint_reject",
            resource: "Complaint",
            resourceId: id,
            details: { complaintId: id, status, adminNotes },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        res.json({ message: "Complaint status updated", complaint });
    }
    catch (error) {
        console.error("Update complaint status error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateComplaintStatus = updateComplaintStatus;
const promoteUserSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    role: zod_1.z.enum(["tenant", "owner", "admin"]),
});
const updateUserRole = async (req, res) => {
    try {
        const validatedData = promoteUserSchema.parse(req.body);
        const user = await User_1.default.findById(validatedData.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const oldRole = user.role;
        user.role = validatedData.role;
        await user.save();
        // Log audit
        await AuditLog_1.default.create({
            admin: req.user._id,
            action: validatedData.role === "admin" ? "user_promote" : "user_demote",
            resource: "User",
            resourceId: validatedData.userId,
            details: {
                userId: validatedData.userId,
                oldRole,
                newRole: validatedData.role,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        res.json({ message: "User role updated", user });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error("Update user role error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateUserRole = updateUserRole;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.role === "admin") {
            return res
                .status(400)
                .json({ message: "Cannot delete admin users" });
        }
        await User_1.default.findByIdAndDelete(id);
        // Log audit
        await AuditLog_1.default.create({
            admin: req.user._id,
            action: "user_delete",
            resource: "User",
            resourceId: id,
            details: { userId: id, email: user.email },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteUser = deleteUser;
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find()
            .select("-password")
            .sort({ createdAt: -1 });
        res.json(users);
    }
    catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAllUsers = getAllUsers;
const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog_1.default.find()
            .populate("admin", "name email")
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    }
    catch (error) {
        console.error("Get audit logs error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAuditLogs = getAuditLogs;
//# sourceMappingURL=adminController.js.map