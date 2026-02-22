import mongoose, { Document } from "mongoose";
export interface IRoom {
    roomType: "single" | "sharing";
    capacity: number;
    availableCount: number;
    monthlyRent: number;
    securityDeposit: number;
    rules: string[];
    allowedGender: "boys" | "girls" | "both";
    occupancyStatus: "occupied" | "vacant";
    occupiedCount: number;
    vacantCount: number;
}
export interface IProperty extends Document {
    owner: mongoose.Types.ObjectId;
    name: string;
    nearestCollege: string;
    distanceFromCollege: number;
    facilities: string[];
    images: string[];
    rooms: IRoom[];
    status: "pending" | "approved" | "rejected";
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProperty, {}, {}, {}, mongoose.Document<unknown, {}, IProperty, {}, {}> & IProperty & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Property.d.ts.map