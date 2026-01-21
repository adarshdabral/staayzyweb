"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wishlistController_1 = require("../controllers/wishlistController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("tenant"), wishlistController_1.addToWishlist);
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("tenant"), wishlistController_1.getWishlist);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("tenant"), wishlistController_1.removeFromWishlist);
exports.default = router;
//# sourceMappingURL=wishlist.js.map