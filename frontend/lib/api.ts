import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/lib/store";

/* ──────────────────────────────
   BASE URL
────────────────────────────── */
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL;
const IS_PROD = process.env.NODE_ENV === "production";

// Prefer build-time configured API URL when provided. Otherwise defer to
// computing the backend base URL at runtime (in the browser) so that when
// a developer opens the frontend via a LAN IP the API requests go to the
// correct host instead of the browser's localhost loopback.
//
// Implementation note: Next inlines process.env.NEXT_PUBLIC_* at build time,
// so relying on runtime detection avoids the client being stuck with a
// localhost value baked into the bundle.
const BUILD_API_BASE = RAW_API_URL ? RAW_API_URL.replace(/\/+$/, "") + "/api" : "";

// We'll create the axios instance potentially without a baseURL and set a
// runtime baseURL in the request interceptor when necessary.
let API_BASE_URL = BUILD_API_BASE || "";

/* ──────────────────────────────
   AXIOS INSTANCE
────────────────────────────── */
const api = axios.create({
  baseURL: API_BASE_URL,
  // Do not set a default Content-Type here. Let the interceptor or the
  // browser set it per-request (important for FormData / multipart requests).
});

// Allow cross-site cookies/credentials if the backend uses them. This is a
// no-op if the backend doesn't set cookies, but required when cookies are
// used for auth (and the backend also sets proper SameSite/secure flags).
api.defaults.withCredentials = true;

/* ──────────────────────────────
   REQUEST INTERCEPTOR
────────────────────────────── */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;

    // Compute runtime baseURL for browser clients when appropriate. This
    // helps two cases:
    //  - No build-time NEXT_PUBLIC_API_URL was provided (empty BUILD_API_BASE)
    //  - A build-time value points at localhost (common during local dev),
    //    but the page is opened via a LAN IP so requests should target the
    //    LAN host rather than the browser's loopback.
    try {
      if (typeof window !== "undefined") {
        const host = window.location.hostname;
        const protocol = window.location.protocol === "https:" ? "https" : "http";
        const port = 5001; // default backend port for local dev

        const shouldOverrideLocalhost = !!config.baseURL && /localhost|127\.0\.0\.1/.test(config.baseURL) && !/localhost|127\.0\.0\.1/.test(host);

        if (!config.baseURL || shouldOverrideLocalhost) {
          const runtimeBase = `${protocol}://${host}:${port}/api`;
          config.baseURL = runtimeBase;
          if (process.env.NODE_ENV === "development") {
            console.log("[API] Runtime baseURL computed:", config.baseURL, "(overrideLocalhost=", shouldOverrideLocalhost, ")");
          }
        }
      }
    } catch (e) {
      // ignore runtime detection errors — we'll fall back to build-time value
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If we're sending FormData, delete any explicit Content-Type so the
    // browser/axios can set the proper multipart boundary header.
    try {
      if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        if (config.headers && "Content-Type" in config.headers) {
          delete (config.headers as any)["Content-Type"];
        }
      } else {
        // For non-FormData requests, ensure JSON header is set explicitly
        if (config.headers && !("Content-Type" in config.headers)) {
          (config.headers as any)["Content-Type"] = "application/json";
        }
      }
    } catch (e) {
      // noop
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`
      );
      if (config.data) {
        console.log("[API REQUEST] Payload:", config.data);
      }
    }

    // Safety: block accidental relative requests in production when the API
    // base URL isn't configured. Relative requests will hit the frontend origin
    // and will usually trigger opaque CORS/network errors that are hard to
    // debug. If this module is misconfigured in production, fail fast in the
    // browser so the deploy is noticed and fixed.
    if (IS_PROD && !RAW_API_URL && typeof window !== "undefined") {
      const requested = (config.url || "").toString();
      // treat plain paths (starting with /) as relative
      if (requested.startsWith("/")) {
        const msg = `[API] Blocked relative request in production: ${requested}. Set NEXT_PUBLIC_API_URL to your API base URL (no trailing /).`;
        console.error(msg);
        throw new Error(msg);
      }
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("[API REQUEST ERROR]", error);
    return Promise.reject(error);
  }
);

/* ──────────────────────────────
   RESPONSE INTERCEPTOR
────────────────────────────── */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API RESPONSE] ${response.status} ${response.config.url}`,
        response.data
      );
    }
    return response;
  },
  (error: AxiosError) => {
    // Attach backend response (if any) onto the error for callers to inspect
    try {
      (error as any).backend = error.response?.data;
    } catch (e) {
      // ignore
    }

    const requestInfo = {
      method: error.config?.method,
      url: `${error.config?.baseURL || ""}${error.config?.url || ""}`,
      baseURL: error.config?.baseURL,
    };

    // Detect network / CORS errors: axios/ browsers usually produce an
    // Error with no response when the request never reached the backend or
    // was blocked by CORS. Surface a clear, actionable log for that case.
    if (!error.response) {
      console.error("Backend not reached (network or CORS issue)");
      console.error("[API] Resolved request URL:", requestInfo.url);
      console.error("[API] Request details:", requestInfo);
      console.error(
        "[API] If your frontend and backend are on different origins, ensure:\n  - the backend sets 'Access-Control-Allow-Credentials: true' and an exact 'Access-Control-Allow-Origin' matching the request origin;\n  - cookies are set with SameSite=None and Secure in production;\n+  - NEXT_PUBLIC_API_URL is set to the backend URL (no trailing /)."
      );
      if (process.env.NODE_ENV === "development") {
        console.error("Axios error (no response):", error);
      }
      return Promise.reject(error);
    }

    // If we have a backend response, log helpful fields in development.
    if (!IS_PROD) {
      try {
        const status = error.response?.status;
        const respData = error.response?.data;

        // Use warn for expected client errors (401/403/4xx) to reduce noise in dev
        // and reserve console.error for server (5xx) issues.
        const logger = (status && status >= 500) ? console.error : console.warn;

        logger("[API RESPONSE]", { url: requestInfo.url, status, response: respData });

        if (respData && typeof respData === "object") {
          logger("[API] Backend message:", (respData as any).message || null);
          logger("[API] Backend error:", (respData as any).error || null);
        }

        if (error.stack) {
          logger("[API] Axios error stack:", error.stack);
        }
      } catch (logErr) {
        // Never throw from a logging path — fail silently if inspection/printing errors
        console.warn("[API] Logging failure:", logErr);
      }
    }

    // Preserve original AxiosError with backend data attached
    return Promise.reject(error);
  }
);

export default api;
