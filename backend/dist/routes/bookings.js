"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../controllers/bookingController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("tenant"), bookingController_1.createBooking);
router.get("/", auth_1.authenticate, bookingController_1.getBookings);
router.get("/:id", auth_1.authenticate, bookingController_1.getBookingById);
router.put("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("owner", "admin"), bookingController_1.updateBookingStatus);
exports.default = router;
//# sourceMappingURL=bookings.js.map