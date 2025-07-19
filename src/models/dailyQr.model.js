import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const dailyQrSchema = new Schema({

    qrId: {
        type: String,
        required: true
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},
    { timestamps: true }
);

export const DailyQr = mongoose.model("DailyQr", dailyQrSchema);
