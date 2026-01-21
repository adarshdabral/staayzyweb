"use strict";
// import jwt from "jsonwebtoken";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
// export const generateToken = (userId: string): string => {
//   return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
// };
// export const verifyToken = (token: string): any => {
//   return jwt.verify(token, JWT_SECRET);
// };
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (payload) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    // Ensure types align with jsonwebtoken's expectations
    const secret = JWT_SECRET;
    // process.env values are strings; cast to any to satisfy the SignOptions type
    const expiresIn = process.env.JWT_EXPIRE || "7d";
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign({ id: payload.id, role: payload.role }, secret, options);
};
exports.generateToken = generateToken;
//# sourceMappingURL=jwt.js.map