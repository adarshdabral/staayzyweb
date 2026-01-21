import mongoose, { Document } from "mongoose";
export interface IReferral extends Document {
    referrer: mongoose.Types.ObjectId;
    referred: mongoose.Types.ObjectId;
    referralCode: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IReferral, {}, {}, {}, mongoose.Document<unknown, {}, IReferral, {}, {}> & IReferral & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Referral.d.ts.map