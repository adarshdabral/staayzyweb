import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

router.post("/", authenticate, authorize("tenant"), addToWishlist);
router.get("/", authenticate, authorize("tenant"), getWishlist);
router.delete("/:id", authenticate, authorize("tenant"), removeFromWishlist);

export default router;


