import mongoose, { Document } from "mongoose";
export interface IBooking extends Document {
    tenant: mongoose.Types.ObjectId;
    property: mongoose.Types.ObjectId;
    room: mongoose.Types.ObjectId;
    rent: number;
    securityDeposit: number;
    status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
    startDate: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IBooking, {}, {}, {}, mongoose.Document<unknown, {}, IBooking, {}, {}> & IBooking & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Booking.d.ts.map