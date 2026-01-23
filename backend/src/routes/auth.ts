import express from "express";
import { register, login, getMe, logout } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

export default router;


