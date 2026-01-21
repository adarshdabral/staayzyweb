import mongoose, { Document } from "mongoose";
export interface IReview extends Document {
    property: mongoose.Types.ObjectId;
    tenant: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview, {}, {}> & IReview & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Review.d.ts.map