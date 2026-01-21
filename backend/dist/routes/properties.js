"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const propertyController_1 = require("../controllers/propertyController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Attach user when present but allow public access – controllers will enforce owner=me
router.get("/", auth_1.optionalAuthenticate, propertyController_1.getProperties);
// Attach optionalAuthenticate so req.user is available when a token is provided
// (this allows getPropertyById to determine if the requester is the owner).
router.get("/:id", auth_1.optionalAuthenticate, propertyController_1.getPropertyById);
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("owner", "admin"), propertyController_1.createProperty);
router.post("/:propertyId/rooms", auth_1.authenticate, (0, auth_1.authorize)("owner", "admin"), propertyController_1.addRoom);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("owner", "admin"), propertyController_1.updateProperty);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("owner", "admin"), propertyController_1.deleteProperty);
exports.default = router;
//# sourceMappingURL=properties.js.map