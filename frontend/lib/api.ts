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

// In development, fall back to localhost for convenience. In production we
// prefer an explicit NEXT_PUBLIC_API_URL to avoid pointing to developer
// machines by accident.
const API_BASE_URL = `${RAW_API_URL ?? (process.env.NODE_ENV === "development" ? "http://localhost:5001" : "")}/api`;

if (process.env.NODE_ENV === "development") {
  console.log("[API] Base URL:", API_BASE_URL);
} else if (!RAW_API_URL) {
  // Helpful runtime hint for production deploys (e.g. Vercel) if env var
  // wasn't provided.
  console.warn(
    "[API] WARNING: NEXT_PUBLIC_API_URL is not set — frontend will use the default localhost URL. Set NEXT_PUBLIC_API_URL in your deployment environment to the API server URL."
  );
}

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

    if (process.env.NODE_ENV === "development") {
      console.error("[API RESPONSE ERROR]");
      console.error("URL:", error.config?.url);
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      if (error.response?.data && typeof error.response.data === "object") {
        // Try to log common fields
        console.error("Backend message:", (error.response.data as any).message);
        console.error("Backend error:", (error.response.data as any).error);
      }
      console.error("Axios error stack:", error.stack);
    }

    // Preserve original AxiosError with backend data attached
    return Promise.reject(error);
  }
);

export default api;
