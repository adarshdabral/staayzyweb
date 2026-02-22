import mongoose, { Document } from "mongoose";
export interface IRoom extends Document {
    property: mongoose.Types.ObjectId;
    roomType: "single" | "sharing";
    capacity: number;
    availableCount: number;
    monthlyRent: number;
    securityDeposit: number;
    rules: string[];
    allowedGender?: "boys" | "girls" | "both";
    occupancyStatus?: "occupied" | "vacant";
    occupiedCount?: number;
    vacantCount?: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IRoom, {}, {}, {}, mongoose.Document<unknown, {}, IRoom, {}, {}> & IRoom & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Room.d.ts.map