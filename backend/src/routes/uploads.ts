import express from "express";
import { upload } from "../utils/upload";
import { uploadImages } from "../controllers/uploadController";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// Allow owners and admins to upload images (owners upload property images)
router.post("/images", authenticate, authorize("owner", "admin"), upload.array("images", 10), uploadImages);

export default router;
