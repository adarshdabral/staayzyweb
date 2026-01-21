import express from "express";
import {
  createReview,
  getReviews,
  getPropertyReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

router.get("/", getReviews);
router.get("/property/:id", getPropertyReviews);
router.post("/", authenticate, authorize("tenant"), createReview);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

export default router;


