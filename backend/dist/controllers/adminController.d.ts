import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getDashboardStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const approveProperty: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const rejectProperty: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPendingProperties: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllComplaints: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateComplaintStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateUserRole: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAuditLogs: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map