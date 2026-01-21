import express from "express";
import {
  getDashboardStats,
  approveProperty,
  rejectProperty,
  getPendingProperties,
  getAllComplaints,
  updateComplaintStatus,
  updateUserRole,
  deleteUser,
  getAllUsers,
  getAuditLogs,
} from "../controllers/adminController";
import { authenticate, authorize } from "../middleware/auth";
import { logAdminAction } from "../middleware/auditLog";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));
router.use(logAdminAction);

router.get("/dashboard", getDashboardStats);
router.get("/properties/pending", getPendingProperties);
router.put("/properties/:id/approve", approveProperty);
router.put("/properties/:id/reject", rejectProperty);
router.get("/complaints", getAllComplaints);
router.put("/complaints/:id/status", updateComplaintStatus);
router.get("/users", getAllUsers);
router.put("/users/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/audit-logs", getAuditLogs);

export default router;


