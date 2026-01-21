import mongoose, { Document } from "mongoose";
export interface IComplaint extends Document {
    tenant: mongoose.Types.ObjectId;
    property: mongoose.Types.ObjectId;
    subject: string;
    description: string;
    status: "pending" | "in-progress" | "resolved" | "rejected";
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IComplaint, {}, {}, {}, mongoose.Document<unknown, {}, IComplaint, {}, {}> & IComplaint & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Complaint.d.ts.map