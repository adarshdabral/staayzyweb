import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const createReview: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getReviews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPropertyReviews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateReview: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteReview: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=reviewController.d.ts.map