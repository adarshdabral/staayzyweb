import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { promises as dns } from "dns";

// Routes
import authRoutes from "./routes/auth";
import propertyRoutes from "./routes/properties";
import bookingRoutes from "./routes/bookings";
import reviewRoutes from "./routes/reviews";
import complaintRoutes from "./routes/complaints";
import wishlistRoutes from "./routes/wishlist";
import adminRoutes from "./routes/admin";
import userRoutes from "./routes/users";
import uploadRoutes from "./routes/uploads";

/* ──────────────────────────────
   ENV SETUP
────────────────────────────── */
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5001;

console.log("[BOOT] Server starting on port", PORT);

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

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no Origin (e.g., server-to-server, curl)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Explicit preflight handling using the same options so OPTIONS responses
// include the same Access-Control-* headers.
app.options("*", cors(corsOptions));

console.log("[CORS] Allowed origin(s):", ALLOWED_ORIGINS.join(", "));

/* ──────────────────────────────
   BODY PARSERS
────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/staayzy";

// Mask credentials for safe logging
const getMaskedUri = (uri: string) => {
  try {
    if (uri.startsWith("mongodb+srv://") || uri.startsWith("mongodb://")) {
      return uri.replace(/:(.*?)@/, ":*****@");
    }
  } catch (e) {
    // ignore
  }
  return uri;
};

const maskedUri = getMaskedUri(MONGODB_URI);
console.log("[DB] Connecting to MongoDB:", maskedUri);

// Attempt to resolve SRV records early to produce actionable logs for devs
const checkSrv = async (uri: string) => {
  try {
    if (uri.startsWith("mongodb+srv://")) {
      const hostPart = uri.split("@")[1]?.split("/")[0] || ""; // e.g. cluster0.scucbje.mongodb.net
      if (hostPart) {
        const srvName = `_mongodb._tcp.${hostPart}`;
        console.log("[DB] Resolving SRV records for", srvName);
        const records = await dns.resolveSrv(srvName);
        console.log("[DB] SRV records:", records);
      }
    }
  } catch (err: any) {
    console.warn("[DB] SRV lookup failed:", err && err.message ? err.message : err);
  }
};

const connectWithRetry = async (attempt = 1) => {
  try {
    // Check SRV for developer visibility (non-blocking if it fails)
    await checkSrv(MONGODB_URI);

    // Use recommended options; mongoose will ignore unknown options depending on version
    await mongoose.connect(MONGODB_URI, {
      // keep defaults minimal — modern mongoose doesn't require these but they are harmless
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    } as any);

    console.log("[DB] MongoDB connected");
  } catch (err: any) {
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
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uploads", uploadRoutes);

/* ──────────────────────────────
   HEALTH CHECK
────────────────────────────── */
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    dbState: mongoose.connection.readyState,
  });
});

/* ──────────────────────────────
   GLOBAL ERROR HANDLER
────────────────────────────── */
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[ERROR]", err);
  res.status(500).json({ message: "Internal server error" });
});

/* ──────────────────────────────
   SERVER START
────────────────────────────── */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
