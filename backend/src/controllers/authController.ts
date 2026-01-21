import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";
import { generateToken } from "../utils/jwt";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone is required"),
  role: z.enum(["tenant", "owner"]).default("tenant"),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    // Handle referral code if provided
    if (validatedData.referralCode) {
      const referrer = await User.findOne({
        referralCode: validatedData.referralCode,
      });
      if (!referrer) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
    }

    // Create user
    const user = new User({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      phone: validatedData.phone,
      role: validatedData.role,
    });

    try {
      await user.save();
    } catch (saveError: any) {
      // Handle duplicate key errors (race conditions)
      if (saveError?.code === 11000) {
        return res.status(409).json({ message: "Duplicate field value entered", details: saveError.keyValue });
      }
      console.error("User save error:", saveError);
      return res.status(500).json({ message: "Failed to create user" });
    }

    // Create referral record if referral code was used
    if (validatedData.referralCode) {
      const Referral = (await import("../models/Referral")).default;
      const referrer = await User.findOne({
        referralCode: validatedData.referralCode,
      });
      if (referrer) {
        await Referral.create({
          referrer: referrer._id,
          referred: user._id,
          referralCode: validatedData.referralCode,
        });
      }
    }

  const token = generateToken({ id: user._id.toString(), role: user.role });

    res.status(201).json({
      message: "User registered successfully",
      token,
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
      // return all validation messages
      const messages = error.errors.map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", details: messages });
    }
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    // Admin login using credentials from environment (no DB lookup)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (ADMIN_EMAIL && validatedData.email === ADMIN_EMAIL) {
      // Plain-text comparison for env password (do NOT use bcrypt on env secret)
      if (!ADMIN_PASSWORD || validatedData.password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const adminUser = {
        _id: "admin",
        id: "admin",
        name: process.env.ADMIN_NAME || "Admin",
        email: ADMIN_EMAIL,
        phone: process.env.ADMIN_PHONE || "",
        role: "admin",
      } as any;

      const token = generateToken({ id: "admin", role: "admin" });

      return res.json({
        message: "Login successful",
        token,
        user: adminUser,
      });
    }

    // Normal user flow
    const user = await User.findOne({ email: validatedData.email }).select(
      "+password"
    );

    if (!user || !(await user.comparePassword(validatedData.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user._id.toString(), role: user.role });

    res.json({
      message: "Login successful",
      token,
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
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    // Support admin user (not stored in DB)
    if (req.user && (req.user.id === "admin" || req.user._id === "admin")) {
      return res.json({
        _id: "admin",
        name: process.env.ADMIN_NAME || "Admin",
        email: process.env.ADMIN_EMAIL,
        phone: process.env.ADMIN_PHONE || "",
        role: "admin",
      });
    }

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
    console.error("Get me error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


