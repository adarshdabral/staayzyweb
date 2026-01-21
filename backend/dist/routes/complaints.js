"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const complaintController_1 = require("../controllers/complaintController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("tenant"), complaintController_1.createComplaint);
router.get("/", auth_1.authenticate, complaintController_1.getComplaints);
router.get("/:id", auth_1.authenticate, complaintController_1.getComplaintById);
router.put("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("admin"), complaintController_1.updateComplaintStatus);
exports.default = router;
//# sourceMappingURL=complaints.js.map