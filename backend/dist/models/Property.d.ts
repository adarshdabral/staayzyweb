import mongoose, { Document } from "mongoose";
export interface IProperty extends Document {
    owner: mongoose.Types.ObjectId;
    name: string;
    nearestCollege: string;
    distanceFromCollege: number;
    facilities: string[];
    images: string[];
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