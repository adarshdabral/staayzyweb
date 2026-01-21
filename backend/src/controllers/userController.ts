import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
});

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (validatedData.name) user.name = validatedData.name;
    if (validatedData.phone) user.phone = validatedData.phone;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      referralCode: user.referralCode,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


