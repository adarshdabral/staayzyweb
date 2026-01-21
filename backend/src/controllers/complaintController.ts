import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Complaint from "../models/Complaint";
import { z } from "zod";

const createComplaintSchema = z.object({
  propertyId: z.string(),
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
});

export const createComplaint = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "tenant") {
      return res
        .status(403)
        .json({ message: "Only tenants can file complaints" });
    }

    const validatedData = createComplaintSchema.parse(req.body);

    const complaint = new Complaint({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Create complaint error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getComplaints = async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    if (req.user.role === "tenant") {
      query.tenant = req.user._id;
    } else if (req.user.role === "owner") {
      const Property = (await import("../models/Property")).default;
      const properties = await Property.find({ owner: req.user._id });
      query.property = { $in: properties.map((p) => p._id) };
    }
    // Admin can see all complaints

    const complaints = await Complaint.find(query)
      .populate("tenant", "name email phone")
      .populate("property", "name owner")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getComplaintById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
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
    } else if (req.user.role === "owner") {
      const Property = (await import("../models/Property")).default;
      const property = await Property.findById(complaint.property);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      if (property.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(complaint);
  } catch (error) {
    console.error("Get complaint error:", error);
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

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update status" });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    if (adminNotes) complaint.adminNotes = adminNotes;

    await complaint.save();

    res.json({ message: "Complaint status updated", complaint });
  } catch (error) {
    console.error("Update complaint error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


