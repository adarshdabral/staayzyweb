import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const createBooking: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getBookings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getBookingById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateBookingStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=bookingController.d.ts.map