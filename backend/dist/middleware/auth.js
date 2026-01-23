"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.optionalAuthenticate = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
/* ──────────────────────────────
   AUTHENTICATION MIDDLEWARE
────────────────────────────── */
const authenticate = async (req, res, next) => {
    /* ✅ Allow CORS preflight */
    if (req.method === "OPTIONS") {
        return next();
    }
    try {
        if (process.env.NODE_ENV === "development") {
            console.log("[AUTH] Request:", req.method, req.originalUrl);
        }
        // Try cookie first (useful when frontend and backend are on different domains)
        let token = req.cookies?.auth_token;
        // Fallback to Authorization header if cookie missing
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }
        if (!token) {
            if (process.env.NODE_ENV === "development") {
                console.warn("[AUTH] Missing token (cookie or Authorization header)");
            }
            else {
                console.warn("[AUTH] Missing token in production request", { url: req.originalUrl, ip: req.ip });
            }
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }
        if (process.env.NODE_ENV === "development") {
            console.log("[AUTH] Verifying JWT...");
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (process.env.NODE_ENV === "development") {
            console.log("[AUTH] Token decoded:", decoded);
        }
        // Support old tokens with `userId` and new tokens with `id` + `role`
        const id = decoded.id || decoded.userId;
        const role = decoded.role || null;
        if (!id) {
            return res.status(401).json({ message: "Invalid token payload" });
        }
        // Admin token (not in DB)
        if (id === "admin" && role === "admin") {
            req.user = {
                _id: "admin",
                id: "admin",
                role: "admin",
                name: process.env.ADMIN_NAME || "Admin",
                email: process.env.ADMIN_EMAIL,
            };
            return next();
        }
        const user = await User_1.default.findById(id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        // Attach a lightweight user object that contains both the mongoose _id
        // (for backwards compatibility) and a normalized id + role for easy checks.
        req.user = {
            _id: user._id,
            id: user._id.toString(),
            role: user.role,
            name: user.name,
            email: user.email,
        };
        next();
    }
    catch (error) {
        console.error("[AUTH] Authentication failed:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.authenticate = authenticate;
/* ──────────────────────────────
   OPTIONAL AUTHENTICATE
   Used by public endpoints which should attach req.user when a valid
   Authorization header is present but must remain accessible to unauthenticated
   users as well (e.g. GET /properties with optional owner=me)
────────────────────────────── */
const optionalAuthenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }
        const token = authHeader.split(" ")[1];
        if (!token)
            return next();
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET)
            return next();
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const id = decoded.id || decoded.userId;
        const role = decoded.role || null;
        if (!id)
            return next();
        if (id === "admin" && role === "admin") {
            req.user = {
                _id: "admin",
                id: "admin",
                role: "admin",
                name: process.env.ADMIN_NAME || "Admin",
                email: process.env.ADMIN_EMAIL,
            };
            return next();
        }
        const user = await User_1.default.findById(id).select("-password");
        if (!user)
            return next();
        req.user = {
            _id: user._id,
            id: user._id.toString(),
            role: user.role,
            name: user.name,
            email: user.email,
        };
        return next();
    }
    catch (err) {
        // Don't fail the request if token is invalid for optional auth – just continue
        console.warn("[AUTH] optional auth failed:", err.message);
        return next();
    }
};
exports.optionalAuthenticate = optionalAuthenticate;
/* ──────────────────────────────
   AUTHORIZATION (ROLE CHECK)
────────────────────────────── */
const authorize = (...roles) => {
    return (req, res, next) => {
        /* ✅ Allow preflight */
        if (req.method === "OPTIONS") {
            return next();
        }
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!roles.includes(req.user.role)) {
            if (process.env.NODE_ENV === "development") {
                console.warn("[AUTHZ] Access denied:", req.user.role, "required:", roles);
            }
            return res
                .status(403)
                .json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map