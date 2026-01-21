"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.updateProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const zod_1 = require("zod");
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().min(1).optional(),
});
const updateProfile = async (req, res) => {
    try {
        const validatedData = updateProfileSchema.parse(req.body);
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (validatedData.name)
            user.name = validatedData.name;
        if (validatedData.phone)
            user.phone = validatedData.phone;
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateProfile = updateProfile;
const getProfile = async (req, res) => {
    try {
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
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=userController.js.map