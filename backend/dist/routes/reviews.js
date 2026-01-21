"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/", reviewController_1.getReviews);
router.get("/property/:id", reviewController_1.getPropertyReviews);
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("tenant"), reviewController_1.createReview);
router.put("/:id", auth_1.authenticate, reviewController_1.updateReview);
router.delete("/:id", auth_1.authenticate, reviewController_1.deleteReview);
exports.default = router;
//# sourceMappingURL=reviews.js.map