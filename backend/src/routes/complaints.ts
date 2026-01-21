import express from "express";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
} from "../controllers/complaintController";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

router.post("/", authenticate, authorize("tenant"), createComplaint);
router.get("/", authenticate, getComplaints);
router.get("/:id", authenticate, getComplaintById);
router.put(
  "/:id/status",
  authenticate,
  authorize("admin"),
  updateComplaintStatus
);

export default router;


