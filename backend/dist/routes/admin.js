"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const auditLog_1 = require("../middleware/auditLog");
const router = express_1.default.Router();
// All admin routes require authentication and admin role
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)("admin"));
router.use(auditLog_1.logAdminAction);
router.get("/dashboard", adminController_1.getDashboardStats);
router.get("/properties/pending", adminController_1.getPendingProperties);
router.put("/properties/:id/approve", adminController_1.approveProperty);
router.put("/properties/:id/reject", adminController_1.rejectProperty);
router.get("/complaints", adminController_1.getAllComplaints);
router.put("/complaints/:id/status", adminController_1.updateComplaintStatus);
router.get("/users", adminController_1.getAllUsers);
router.put("/users/role", adminController_1.updateUserRole);
router.delete("/users/:id", adminController_1.deleteUser);
router.get("/audit-logs", adminController_1.getAuditLogs);
exports.default = router;
//# sourceMappingURL=admin.js.map