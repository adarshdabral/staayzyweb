"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAdminAction = void 0;
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const logAdminAction = async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (data) {
        // Only log if admin made an action
        if (req.user?.role === "admin" &&
            req.method !== "GET" &&
            res.statusCode < 400) {
            const actionMap = {
                "POST /api/admin/properties": "property_approve",
                "PUT /api/admin/properties": "property_reject",
                "PUT /api/admin/complaints": "complaint_resolve",
                "POST /api/admin/users": "user_promote",
                "DELETE /api/admin/users": "user_delete",
            };
            const action = actionMap[`${req.method} ${req.route?.path || req.path}`];
            if (action) {
                AuditLog_1.default.create({
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
exports.logAdminAction = logAdminAction;
//# sourceMappingURL=auditLog.js.map