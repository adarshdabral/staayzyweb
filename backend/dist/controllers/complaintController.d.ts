import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const createComplaint: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getComplaints: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getComplaintById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateComplaintStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=complaintController.d.ts.map