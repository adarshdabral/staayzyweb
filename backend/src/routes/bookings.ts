import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
} from "../controllers/bookingController";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

router.post("/", authenticate, authorize("tenant"), createBooking);
router.get("/", authenticate, getBookings);
router.get("/:id", authenticate, getBookingById);
router.put(
  "/:id/status",
  authenticate,
  authorize("owner", "admin"),
  updateBookingStatus
);

export default router;


