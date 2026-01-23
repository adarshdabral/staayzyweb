Production deployment checklist — staayzy

This checklist contains the essential steps and runtime configuration required to deploy the frontend (Vercel) and backend (Render) and ensure cross-origin auth (httpOnly cookie + JWT) works correctly.

1) Backend (Render) — required env vars

- JWT_SECRET (required)
- MONGODB_URI (required)
- CLIENT_URL (recommended) — your frontend URL (e.g. https://staayzyweb.vercel.app). If provided it will be included as an allowed CORS origin.
- TRUST_PROXY (optional) — set to "1" if you want Express to trust the proxy; recommended when behind Render (the server also sets trust-proxy when NODE_ENV=production).
- ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME (optional) — for admin seeding/quick login
- COOKIE_MAX_AGE_MS (optional) — cookie lifetime in ms (default 7 days)

Important: In production the server validates that JWT_SECRET and MONGODB_URI are present and will exit if they are missing.

2) Frontend (Vercel) — required env vars

- NEXT_PUBLIC_API_URL (required in production) — e.g. https://your-render-service.onrender.com
  - Do NOT add a trailing slash. The frontend will append "/api" for you.
  - Example: NEXT_PUBLIC_API_URL=https://staayzy-api.onrender.com

Why this matters:
- The frontend sets axios.defaults.withCredentials = true and the backend sets cookies with SameSite=None + Secure. For browsers to accept the cookie:
  - The backend must respond with Access-Control-Allow-Credentials: true (set in server),
  - Access-Control-Allow-Origin must be the exact request origin (not "*") — our server enforces this using ALLOWED_ORIGINS,
  - Cookies must be set with SameSite=None and Secure in production (server handles this).

3) Render / Vercel configuration

- Backend (Render):
  - Deploy the `backend` folder as a Node service.
  - Expose port the service uses (Render provides a URL like https://<service>.onrender.com).
  - Set environment variables listed above.
  - Ensure the service uses HTTPS (Render provides HTTPS by default).

- Frontend (Vercel):
  - Set `NEXT_PUBLIC_API_URL` to the Render URL (no trailing slash).
  - Build and deploy.

4) Quick smoke tests (after deploy)

- Health check:
  - curl -i https://<backend>/api/health
  - Expected: 200 and JSON with status "ok" and dbState

- Login/register flow (browser):
  - From your deployed frontend, register or log in.
  - In the browser devtools under "Application > Cookies" you should see `auth_token` set for the backend domain. Because it's httpOnly you won't be able to inspect its value, but it should exist.
  - Verify `GET /api/auth/me` returns the logged-in user when called from the frontend (has credentials).

- Troubleshooting for common issues:
  - "Network Error" with no response in console: often caused by missing NEXT_PUBLIC_API_URL in the frontend or CORS issues. See `frontend/lib/api.ts` logs — the client throws and logs a helpful message if NEXT_PUBLIC_API_URL is missing in production.
  - Cookies not set: ensure backend runs behind HTTPS and the `secure` flag is true (production), and that `trust proxy` is enabled in Express (ours is set automatically when NODE_ENV=production). Also ensure Render provides HTTPS to clients.
  - CORS denied: check backend logs — rejected origins are logged with [CORS] Rejected origin: <origin>.

5) Notes and safety

- The backend will fail fast in production if `JWT_SECRET` or `MONGODB_URI` are missing. This intentionally avoids accidental insecure deployments.
- The frontend will block relative API requests in production if `NEXT_PUBLIC_API_URL` is not set (fail-fast in browser). This avoids confusing opaque network/CORS errors.

6) Optional hardening / follow-ups

- Add `helmet` and other security middleware to set secure headers.
- Add server-side role-based guards for owner pages (we currently check on the client + API enforcement is present on protected endpoints).
- Add e2e smoke tests that run against a staging deployment.

If you want, I can:
- Add `DEPLOY.md` content to `README.md` instead.
- Add a minimal `helm`/Render deploy script or Render dashboard guidance.
- Add GitHub workflow for automated deploy checks.
