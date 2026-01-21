import mongoose, { Document } from "mongoose";
export interface IWishlist extends Document {
    tenant: mongoose.Types.ObjectId;
    property: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<IWishlist, {}, {}, {}, mongoose.Document<unknown, {}, IWishlist, {}, {}> & IWishlist & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Wishlist.d.ts.map