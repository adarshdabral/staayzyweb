import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const addToWishlist: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getWishlist: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeFromWishlist: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=wishlistController.d.ts.map