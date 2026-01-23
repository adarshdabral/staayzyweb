import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
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

// Minimal production-time environment validation to fail fast and provide
// actionable errors. This prevents subtle runtime failures (auth/db) after
// deploy when required vars are missing.
const IS_PROD = process.env.NODE_ENV === "production";
if (IS_PROD) {
  const missing: string[] = [];
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");
  if (!process.env.MONGODB_URI) missing.push("MONGODB_URI");

  if (missing.length > 0) {
    console.error("[CONFIG] Missing required environment variables:", missing.join(", "));
    console.error("[CONFIG] In production these must be set. Exiting to avoid insecure or broken runtime behavior.");
    process.exit(1);
  }
}

const app = express();
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

// Accept common private LAN subnets for local testing (port 3000). We use a
// regex check instead of a permissive wildcard so credentialed requests may
// be supported while still keeping the check reasonably scoped for dev use.
// Matches:
//  - http://10.x.x.x:3000
//  - http://192.168.x.x:3000
//  - http://172.16.x.x:3000 through http://172.31.x.x:3000
const LAN_PRIVATE_REGEX = /^http:\/\/(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}):3000$/;

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    // Debug: log incoming origin so we can see what the browser is sending.
    console.log("[CORS] Incoming Origin:", origin);

    // Allow requests with no Origin (e.g., server-to-server, curl)
    if (!origin) return callback(null, true);

    // Exact-match allowed origins
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      console.log("[CORS] Allowed origin (exact):", origin);
      return callback(null, true);
    }

    // Allow common private LAN origins for local in-network testing (port 3000)
    if (LAN_PRIVATE_REGEX.test(origin)) {
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

app.use(cors(corsOptions));

// Explicitly handle preflight requests using the configured options only.
// Do NOT add a plain `cors()` handler after this as it would respond without
// credentials and break cross-site cookie scenarios.
app.options("*", cors(corsOptions));

console.log("[CORS] Allowed origin(s):", ALLOWED_ORIGINS.join(", "));

/* ──────────────────────────────
   BODY PARSERS
────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse cookies so middleware can read auth cookies when present
app.use(cookieParser());

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

// Lightweight network health endpoint for simple network / load-balancer /
// browser probes. Returns plain ok to make `curl http://HOST:PORT/health` easy
// to use during LAN troubleshooting.
app.get("/health", (_req, res) => {
  res.json({ ok: true });
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
// Bind to 0.0.0.0 so the server is reachable on the host's LAN IP (not only
// on 127.0.0.1). This is important for local network testing (e.g. http://10.159.x.x:3000
// talking to http://<machine-ip>:5001).
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT} (accessible via LAN IP)`);
});
