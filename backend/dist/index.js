"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
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
// Minimal production-time environment validation to fail fast and provide
// actionable errors. This prevents subtle runtime failures (auth/db) after
// deploy when required vars are missing.
const IS_PROD = process.env.NODE_ENV === "production";
if (IS_PROD) {
    const missing = [];
    if (!process.env.JWT_SECRET)
        missing.push("JWT_SECRET");
    if (!process.env.MONGODB_URI)
        missing.push("MONGODB_URI");
    if (missing.length > 0) {
        console.error("[CONFIG] Missing required environment variables:", missing.join(", "));
        console.error("[CONFIG] In production these must be set. Exiting to avoid insecure or broken runtime behavior.");
        process.exit(1);
    }
}
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5001;
console.log("[BOOT] Server starting on port", PORT);
// Trust proxy when running behind Render / Vercel so `secure` cookies work
// (they require req.secure or trust proxy to detect HTTPS when proxied).
app.set("trust proxy", process.env.TRUST_PROXY === "1" || process.env.NODE_ENV === "production");
/* ──────────────────────────────
   CORS (FINAL, SAFE CONFIG)
────────────────────────────── */
// Allowed origins: keep minimal and explicit for production safety.
// Permit both local dev and the Vercel deployment for staayzyweb.
const RAW_FRONTEND = process.env.CLIENT_URL || "";
const DEFAULT_ALLOWED = [
    "http://localhost:3000",
    "https://staayzyweb.vercel.app",
];
// If deploy-time CLIENT_URL is provided, include any comma-separated entries
// but ensure we don't accidentally allow anything else — merge and dedupe.
const envOrigins = RAW_FRONTEND
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const ALLOWED_ORIGINS = Array.from(new Set([...DEFAULT_ALLOWED, ...envOrigins]));
// Accept a small LAN subnet for local testing (10.159.x.x:3000). We use a
// regex check instead of a permissive wildcard so credentials header may be
// supported while still being reasonably safe for local testing.
const LAN_10_159_REGEX = /^http:\/\/10\.159\.\d{1,3}\.\d{1,3}:3000$/;
const corsOptions = {
    origin: function (origin, callback) {
        // Debug: log incoming origin so we can see what the browser is sending.
        console.log("[CORS] Incoming Origin:", origin);
        // Allow requests with no Origin (e.g., server-to-server, curl)
        if (!origin)
            return callback(null, true);
        // Exact-match allowed origins
        if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
            console.log("[CORS] Allowed origin (exact):", origin);
            return callback(null, true);
        }
        // Allow the LAN 10.159.* host for in-network testing (port 3000)
        if (LAN_10_159_REGEX.test(origin)) {
            console.log("[CORS] Allowing LAN origin for dev testing:", origin);
            return callback(null, true);
        }
        // Log the rejected origin for easier production debugging
        console.warn("[CORS] Rejected origin:", origin);
        return callback(new Error(`CORS origin denied: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
// Explicitly handle preflight requests using the configured options only.
// Do NOT add a plain `cors()` handler after this as it would respond without
// credentials and break cross-site cookie scenarios.
app.options("*", (0, cors_1.default)(corsOptions));
console.log("[CORS] Allowed origin(s):", ALLOWED_ORIGINS.join(", "));
/* ──────────────────────────────
   BODY PARSERS
────────────────────────────── */
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Parse cookies so middleware can read auth cookies when present
app.use((0, cookie_parser_1.default)());
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
// Lightweight network health endpoint for simple network / load-balancer /
// browser probes. Returns plain ok to make `curl http://HOST:PORT/health` easy
// to use during LAN troubleshooting.
app.get("/health", (_req, res) => {
    res.json({ ok: true });
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
// Bind to 0.0.0.0 so the server is reachable on the host's LAN IP (not only
// on 127.0.0.1). This is important for local network testing (e.g. http://10.159.x.x:3000
// talking to http://<machine-ip>:5001).
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on 0.0.0.0:${PORT} (accessible via LAN IP)`);
});
//# sourceMappingURL=index.js.map