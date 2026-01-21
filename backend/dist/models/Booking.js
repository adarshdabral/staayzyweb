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
const BookingSchema = new mongoose_1.Schema({
    tenant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Tenant is required"],
    },
    property: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Property",
        required: [true, "Property is required"],
    },
    room: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Room",
        required: [true, "Room is required"],
    },
    rent: {
        type: Number,
        required: [true, "Rent is required"],
        min: [0, "Rent cannot be negative"],
    },
    securityDeposit: {
        type: Number,
        required: [true, "Security deposit is required"],
        min: [0, "Security deposit cannot be negative"],
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed", "cancelled"],
        default: "pending",
    },
    startDate: {
        type: Date,
        required: [true, "Start date is required"],
    },
    endDate: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Prevent overbooking: Decrease available count when booking is approved
BookingSchema.post("findOneAndUpdate", async function (doc) {
    if (doc && doc.status === "approved") {
        const Room = mongoose_1.default.model("Room");
        await Room.findByIdAndUpdate(doc.room, { $inc: { availableCount: -1 } });
    }
    if (doc && doc.status === "cancelled") {
        const Room = mongoose_1.default.model("Room");
        const booking = await mongoose_1.default.model("Booking").findById(doc._id);
        if (booking && booking.status === "approved") {
            await Room.findByIdAndUpdate(doc.room, { $inc: { availableCount: 1 } });
        }
    }
});
exports.default = mongoose_1.default.model("Booking", BookingSchema);
//# sourceMappingURL=Booking.js.map