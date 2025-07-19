import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";
import { DailyQr } from "./dailyQr.model.js";
const punchHistorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    qrId: {
        type: Schema.Types.ObjectId,
        ref: "DailyQr",
        required: true // RECOMMENDATION: Make this required if every punch *must* be via QR
    },
    deviceIp: {
        type: String,
        required: true,
    },
    timestamp: { // When the punch actually occurred
        type: Date,
        default: Date.now,
        required: true
    },
    type: { // 'check-in' or 'check-out'
        type: String,
        enum: ['check-in', 'check-out'], // Enforce specific values
        required: true
    }
    // ---------------------------------------------
},
    {
        timestamps: true
    }
);

export const PunchHistory = mongoose.model("PunchHistory", punchHistorySchema);