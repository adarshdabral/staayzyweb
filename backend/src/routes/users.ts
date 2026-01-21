import express from "express";
import { updateProfile, getProfile } from "../controllers/userController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;


