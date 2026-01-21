import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Property from "../models/Property";
import Complaint from "../models/Complaint";
import User from "../models/User";
import Booking from "../models/Booking";
import AuditLog from "../models/AuditLog";
import { z } from "zod";

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalListings = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Calculate revenue (sum of all approved bookings' rent)
    const bookings = await Booking.find({ status: "approved" });
    const totalRevenue = bookings.reduce((sum, b) => sum + b.rent, 0);

    // Pending approvals
    const pendingProperties = await Property.countDocuments({
      status: "pending",
    });

    // Pending complaints
    const pendingComplaints = await Complaint.countDocuments({
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
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate property existence
    const property = await Property.findById(id);
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
    await AuditLog.create({
      admin: req.user._id,
      action: "property_approve",
      resource: "Property",
      resourceId: id,
      details: { propertyId: id, status: "approved" },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ message: "Property approved", property });
  } catch (error: any) {
    console.error("Approve property error:", error);
    res.status(500).json({ message: "Failed to approve property", error: error.message });
  }
};

export const rejectProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const property = await Property.findById(id);
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
    await AuditLog.create({
      admin: req.user._id,
      action: "property_reject",
      resource: "Property",
      resourceId: id,
      details: { propertyId: id, status: "rejected", reason: rejectionReason },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ message: "Property rejected", property });
  } catch (error: any) {
    console.error("Reject property error:", error);
    res.status(500).json({ message: "Failed to reject property", error: error.message });
  }
};

export const getPendingProperties = async (req: AuthRequest, res: Response) => {
  try {
    const properties = await Property.find({ status: "pending" })
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error("Get pending properties error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await Complaint.find()
      .populate("tenant", "name email phone")
      .populate("property", "name owner")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error("Get all complaints error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateComplaintStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!["pending", "in-progress", "resolved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    if (adminNotes) complaint.adminNotes = adminNotes;

    await complaint.save();

    // Log audit
    await AuditLog.create({
      admin: req.user._id,
      action: status === "resolved" ? "complaint_resolve" : "complaint_reject",
      resource: "Complaint",
      resourceId: id,
      details: { complaintId: id, status, adminNotes },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ message: "Complaint status updated", complaint });
  } catch (error) {
    console.error("Update complaint status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const promoteUserSchema = z.object({
  userId: z.string(),
  role: z.enum(["tenant", "owner", "admin"]),
});

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = promoteUserSchema.parse(req.body);

    const user = await User.findById(validatedData.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldRole = user.role;
    user.role = validatedData.role;
    await user.save();

    // Log audit
    await AuditLog.create({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res
        .status(400)
        .json({ message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(id);

    // Log audit
    await AuditLog.create({
      admin: req.user._id,
      action: "user_delete",
      resource: "User",
      resourceId: id,
      details: { userId: id, email: user.email },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.find()
      .populate("admin", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


