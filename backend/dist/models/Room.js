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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const RoomSchema = new mongoose_1.Schema({
    property: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Property",
        required: [true, "Property is required"],
    },
    roomType: {
        type: String,
        enum: ["single", "sharing"],
        required: [true, "Room type is required"],
    },
    capacity: {
        type: Number,
        required: [true, "Capacity is required"],
        min: [1, "Capacity must be at least 1"],
    },
    availableCount: {
        type: Number,
        required: [true, "Available count is required"],
        min: [0, "Available count cannot be negative"],
        validate: {
            validator: function () {
                return this.availableCount <= this.capacity;
            },
            message: "Available count cannot exceed capacity",
        },
    },
    monthlyRent: {
        type: Number,
        required: [true, "Monthly rent is required"],
        min: [0, "Monthly rent cannot be negative"],
    },
    securityDeposit: {
        type: Number,
        required: [true, "Security deposit is required"],
        min: [0, "Security deposit cannot be negative"],
    },
    rules: [
        {
            type: String,
            trim: true,
        },
    ],
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Room", RoomSchema);
//# sourceMappingURL=Room.js.map