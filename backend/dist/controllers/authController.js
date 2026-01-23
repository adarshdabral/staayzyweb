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
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    phone: zod_1.z.string().min(1, "Phone is required"),
    role: zod_1.z.enum(["tenant", "owner"]).default("tenant"),
    referralCode: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    password: zod_1.z.string().min(1, "Password is required"),
});
const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        // Check if user exists
        const existingUser = await User_1.default.findOne({ email: validatedData.email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists with this email" });
        }
        // Handle referral code if provided
        if (validatedData.referralCode) {
            const referrer = await User_1.default.findOne({
                referralCode: validatedData.referralCode,
            });
            if (!referrer) {
                return res.status(400).json({ message: "Invalid referral code" });
            }
        }
        // Create user
        const user = new User_1.default({
            name: validatedData.name,
            email: validatedData.email,
            password: validatedData.password,
            phone: validatedData.phone,
            role: validatedData.role,
        });
        try {
            await user.save();
        }
        catch (saveError) {
            // Handle duplicate key errors (race conditions)
            if (saveError?.code === 11000) {
                return res.status(409).json({ message: "Duplicate field value entered", details: saveError.keyValue });
            }
            console.error("User save error:", saveError);
            return res.status(500).json({ message: "Failed to create user" });
        }
        // Create referral record if referral code was used
        if (validatedData.referralCode) {
            const Referral = (await Promise.resolve().then(() => __importStar(require("../models/Referral")))).default;
            const referrer = await User_1.default.findOne({
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
        const token = (0, jwt_1.generateToken)({ id: user._id.toString(), role: user.role });
        // Cookie options
        const isProd = process.env.NODE_ENV === "production";
        const cookieMaxAge = Number(process.env.COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000; // 7 days
        const cookieOptions = {
            httpOnly: true,
            secure: isProd, // only over HTTPS in production
            sameSite: "none", // allow cross-site cookie for Vercel <-> Render
            maxAge: cookieMaxAge,
        };
        // Set auth cookie (used for cross-site auth when frontend and backend are on different domains)
        res.cookie("auth_token", token, cookieOptions);
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            // return all validation messages
            const messages = error.errors.map((e) => e.message);
            return res.status(400).json({ message: "Validation failed", details: messages });
        }
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
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
            };
            const token = (0, jwt_1.generateToken)({ id: "admin", role: "admin" });
            // Set cookie for admin login as well
            const isProd = process.env.NODE_ENV === "production";
            const cookieMaxAge = Number(process.env.COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;
            const cookieOptions = {
                httpOnly: true,
                secure: isProd,
                sameSite: "none",
                maxAge: cookieMaxAge,
            };
            res.cookie("auth_token", token, cookieOptions);
            return res.json({
                message: "Login successful",
                token,
                user: adminUser,
            });
        }
        // Normal user flow
        const user = await User_1.default.findOne({ email: validatedData.email }).select("+password");
        if (!user || !(await user.comparePassword(validatedData.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = (0, jwt_1.generateToken)({ id: user._id.toString(), role: user.role });
        // Set cookie
        const isProd = process.env.NODE_ENV === "production";
        const cookieMaxAge = Number(process.env.COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;
        const cookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: "none",
            maxAge: cookieMaxAge,
        };
        res.cookie("auth_token", token, cookieOptions);
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.login = login;
const logout = async (_req, res) => {
    try {
        const isProd = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: "none",
        };
        res.clearCookie("auth_token", cookieOptions);
        res.json({ message: "Logged out" });
    }
    catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "Failed to logout" });
    }
};
exports.logout = logout;
const getMe = async (req, res) => {
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
        const user = await User_1.default.findById(req.user._id);
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
    }
    catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getMe = getMe;
//# sourceMappingURL=authController.js.map