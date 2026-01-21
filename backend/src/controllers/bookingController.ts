import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Booking from "../models/Booking";
import Room from "../models/Room";
import Property from "../models/Property";
import { z } from "zod";

const createBookingSchema = z.object({
  propertyId: z.string(),
  roomId: z.string(),
  startDate: z.string(),
});

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Only tenants can book rooms" });
    }

    const validatedData = createBookingSchema.parse(req.body);

    const property = await Property.findById(validatedData.propertyId);
    if (!property || property.status !== "approved") {
      return res.status(400).json({ message: "Property not available" });
    }

    const room = await Room.findById(validatedData.roomId);
    if (!room || room.property.toString() !== validatedData.propertyId) {
      return res.status(400).json({ message: "Room not found" });
    }

    if (room.availableCount <= 0) {
      return res.status(400).json({ message: "No rooms available" });
    }

    // Check for existing pending/approved booking for this tenant and room
    const existingBooking = await Booking.findOne({
      tenant: req.user._id,
      room: validatedData.roomId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "You already have a booking for this room" });
    }

    const booking = new Booking({
      tenant: req.user._id,
      property: validatedData.propertyId,
      room: validatedData.roomId,
      rent: room.monthlyRent,
      securityDeposit: room.securityDeposit,
      startDate: validatedData.startDate,
      status: "pending",
    });

    await booking.save();

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    if (req.user.role === "tenant") {
      query.tenant = req.user._id;
    } else if (req.user.role === "owner") {
      const properties = await Property.find({ owner: req.user._id });
      query.property = { $in: properties.map((p) => p._id) };
    }

    const bookings = await Booking.find(query)
      .populate("tenant", "name email phone")
      .populate("property", "name nearestCollege images")
      .populate("room", "roomType capacity monthlyRent")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("tenant", "name email phone")
      .populate("property")
      .populate("room");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check access
    if (req.user.role === "tenant") {
      if (booking.tenant._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (req.user.role === "owner") {
      const property = await Property.findById(booking.property);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (property.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(booking);
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(id).populate("property");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check permissions
    if (status === "cancelled") {
      if (
        booking.tenant.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (status === "approved" || status === "rejected") {
      const property = booking.property as any;
      if (
        property.owner.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ message: "Only owner can approve/reject" });
      }
    }

    const oldStatus = booking.status;

    // Approve: atomically decrement room availableCount only if > 0 to prevent overbooking
    if (status === "approved" && oldStatus !== "approved") {
      const updatedRoom = await Room.findOneAndUpdate(
        { _id: booking.room, availableCount: { $gt: 0 } },
        { $inc: { availableCount: -1 } },
        { new: true }
      );

      if (!updatedRoom) {
        return res.status(400).json({ message: "No rooms available to approve booking" });
      }

      booking.status = "approved";
      await booking.save();

      return res.json({ message: "Booking approved", booking });
    }

    // Cancel: if previously approved, increment availableCount
    if (status === "cancelled" && oldStatus === "approved") {
      await Room.findByIdAndUpdate(booking.room, { $inc: { availableCount: 1 } });
      booking.status = "cancelled";
      await booking.save();
      return res.json({ message: "Booking cancelled", booking });
    }

    // Generic status changes (rejected, completed, etc.)
    booking.status = status;
    if (status === "rejected" && rejectionReason) {
      // Store rejection reason if needed
    }

    await booking.save();

    res.json({ message: "Booking status updated", booking });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


