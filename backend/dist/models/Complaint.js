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
const ComplaintSchema = new mongoose_1.Schema({
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
    subject: {
        type: String,
        required: [true, "Subject is required"],
        trim: true,
        maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    status: {
        type: String,
        enum: ["pending", "in-progress", "resolved", "rejected"],
        default: "pending",
    },
    adminNotes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Complaint", ComplaintSchema);
//# sourceMappingURL=Complaint.js.map