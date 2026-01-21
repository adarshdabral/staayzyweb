"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = require("dns");
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const properties_1 = __importDefault(require("./routes/properties"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const complaints_1 = __importDefault(require("./routes/complaints"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const admin_1 = __importDefault(require("./routes/admin"));
const users_1 = __importDefault(require("./routes/users"));
const uploads_1 = __importDefault(require("./routes/uploads"));
/* ──────────────────────────────
   ENV SETUP
────────────────────────────── */
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5001;
console.log("[BOOT] Server starting on port", PORT);
/* ──────────────────────────────
   CORS (FINAL, SAFE CONFIG)
────────────────────────────── */
const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:3000";
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// ✅ Explicit preflight handling
app.options("*", (0, cors_1.default)());
console.log("[CORS] Allowed origin:", FRONTEND_URL);
/* ──────────────────────────────
   BODY PARSERS
────────────────────────────── */
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
/* ──────────────────────────────
   REQUEST LOGGER
────────────────────────────── */
app.use((req, _res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});
/* ──────────────────────────────
   MONGODB CONNECTION
────────────────────────────── */
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/staayzy";
// Mask credentials for safe logging
const getMaskedUri = (uri) => {
    try {
        if (uri.startsWith("mongodb+srv://") || uri.startsWith("mongodb://")) {
            return uri.replace(/:(.*?)@/, ":*****@");
        }
    }
    catch (e) {
        // ignore
    }
    return uri;
};
const maskedUri = getMaskedUri(MONGODB_URI);
console.log("[DB] Connecting to MongoDB:", maskedUri);
// Attempt to resolve SRV records early to produce actionable logs for devs
const checkSrv = async (uri) => {
    try {
        if (uri.startsWith("mongodb+srv://")) {
            const hostPart = uri.split("@")[1]?.split("/")[0] || ""; // e.g. cluster0.scucbje.mongodb.net
            if (hostPart) {
                const srvName = `_mongodb._tcp.${hostPart}`;
                console.log("[DB] Resolving SRV records for", srvName);
                const records = await dns_1.promises.resolveSrv(srvName);
                console.log("[DB] SRV records:", records);
            }
        }
    }
    catch (err) {
        console.warn("[DB] SRV lookup failed:", err && err.message ? err.message : err);
    }
};
const connectWithRetry = async (attempt = 1) => {
    try {
        // Check SRV for developer visibility (non-blocking if it fails)
        await checkSrv(MONGODB_URI);
        // Use recommended options; mongoose will ignore unknown options depending on version
        await mongoose_1.default.connect(MONGODB_URI, {
        // keep defaults minimal — modern mongoose doesn't require these but they are harmless
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        });
        console.log("[DB] MongoDB connected");
    }
    catch (err) {
        console.error("[DB] MongoDB connection error:", err && err.message ? err.message : err);
        // Provide actionable hints for common SRV / DNS issues
        if (err && err.code === "ENOTFOUND") {
            console.error("[DB] DNS lookup failed - check your network/DNS settings and that the cluster host is correct.");
        }
        if (err && err.message && err.message.includes("querySrv")) {
            console.error("[DB] SRV query failed - this often indicates local DNS or firewall prevents SRV lookups. Try using the standard (non-SRV) connection string from Atlas or check DNS settings.");
        }
        // Retry a couple of times before exiting to allow transient network issues
        if (attempt < 3) {
            const delay = 2000 * attempt;
            console.log(`[DB] Retry connection in ${delay}ms (attempt ${attempt + 1}/3)`);
            await new Promise((r) => setTimeout(r, delay));
            return connectWithRetry(attempt + 1);
        }
        console.error("[DB] Could not connect to MongoDB after multiple attempts. Exiting process.");
        process.exit(1);
    }
};
connectWithRetry();
/* ──────────────────────────────
   ROUTES
────────────────────────────── */
app.use("/api/auth", auth_1.default);
app.use("/api/properties", properties_1.default);
app.use("/api/bookings", bookings_1.default);
app.use("/api/reviews", reviews_1.default);
app.use("/api/complaints", complaints_1.default);
app.use("/api/wishlist", wishlist_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/users", users_1.default);
app.use("/api/uploads", uploads_1.default);
/* ──────────────────────────────
   HEALTH CHECK
────────────────────────────── */
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        dbState: mongoose_1.default.connection.readyState,
    });
});
/* ──────────────────────────────
   GLOBAL ERROR HANDLER
────────────────────────────── */
app.use((err, _req, res, _next) => {
    console.error("[ERROR]", err);
    res.status(500).json({ message: "Internal server error" });
});
/* ──────────────────────────────
   SERVER START
────────────────────────────── */
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map