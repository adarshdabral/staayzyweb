import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import AuditLog from "../models/AuditLog";

export const logAdminAction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    // Only log if admin made an action
    if (
      req.user?.role === "admin" &&
      req.method !== "GET" &&
      res.statusCode < 400
    ) {
      const actionMap: Record<string, string> = {
        "POST /api/admin/properties": "property_approve",
        "PUT /api/admin/properties": "property_reject",
        "PUT /api/admin/complaints": "complaint_resolve",
        "POST /api/admin/users": "user_promote",
        "DELETE /api/admin/users": "user_delete",
      };

      const action = actionMap[`${req.method} ${req.route?.path || req.path}`];

      if (action) {
        AuditLog.create({
          admin: req.user._id,
          action,
          resource: req.route?.path || req.path,
          resourceId: req.params.id,
          details: req.body,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        }).catch((err) => console.error("Audit log error:", err));
      }
    }

    return originalJson(data);
  };

  next();
};


