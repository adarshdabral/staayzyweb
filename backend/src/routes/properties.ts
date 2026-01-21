import express from "express";
import {
  createProperty,
  addRoom,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController";
import { authenticate, authorize, optionalAuthenticate } from "../middleware/auth";

const router = express.Router();

// Attach user when present but allow public access – controllers will enforce owner=me
router.get("/", optionalAuthenticate, getProperties);
// Attach optionalAuthenticate so req.user is available when a token is provided
// (this allows getPropertyById to determine if the requester is the owner).
router.get("/:id", optionalAuthenticate, getPropertyById);

router.post(
  "/",
  authenticate,
  authorize("owner", "admin"),
  createProperty
);
router.post(
  "/:propertyId/rooms",
  authenticate,
  authorize("owner", "admin"),
  addRoom
);
router.put(
  "/:id",
  authenticate,
  authorize("owner", "admin"),
  updateProperty
);
router.delete(
  "/:id",
  authenticate,
  authorize("owner", "admin"),
  deleteProperty
);

export default router;


