import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const uploadImages: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const _default: {
    uploadImages: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
//# sourceMappingURL=uploadController.d.ts.map