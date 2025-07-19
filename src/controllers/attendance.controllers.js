import { DailyQr } from "../models/dailyQr.model.js";
import { ApiErrors } from "../utils/api_errors.js";
import { asyncHandler } from "../utils/async_handler.js";
import { ApiResponse } from "../utils/api_response.js"; // Assuming you have an ApiResponse utility
import mongoose from "mongoose";
import { PunchHistory } from "../models/punchHistory.model.js";

const createDailyQr = asyncHandler(async (req, res) => {
    const { qrId } = req.body;
    const adminId = req.user?._id;
    if (!qrId) {
        throw new ApiErrors(400, "QR ID (code value) is required.");
    }

    if (!adminId) {
        throw new ApiErrors(401, "Admin not authenticated.");
    }

    // --- Logic to prevent multiple QRs for the same day ---
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const existingQrForToday = await DailyQr.findOne({
        adminId: adminId, // You might choose to allow multiple admins to generate QRs, or enforce one global QR
        // If it's one QR for the whole office, remove adminId from this check.
        createdAt: {
            $gte: startOfToday,
            $lte: endOfToday
        }
    });

    if (existingQrForToday) {
        // If a QR code already exists for today by this admin
        throw new ApiErrors(409, "A QR code for today has already been generated.");
    }

    // --- Create the new Daily QR ---
    const dailyQrSaved = await DailyQr.create({
        qrId: qrId,
        adminId: adminId,
        // 'createdAt' will be automatically added by timestamps: true
    });

    if (!dailyQrSaved) {
        throw new ApiErrors(500, "Failed to generate daily QR code. Please try again.");
    }

    // --- Send success response ---
    return res
        .status(201) // 201 Created for successful resource creation
        .json(new ApiResponse(201, dailyQrSaved, "Daily QR code generated successfully!"));
});

const punchAttendance = asyncHandler(async (req, res) => {
    // 1. Extract necessary data from request
    const employeeId = req.user?._id;
    const scannedQrValue = req.body?.qrId;
    const deviceIp = req.ip;
    // const timestamp = req.body?.timestamp; // We'll use server-side timestamp for accuracy

    // 2. Basic Input Validation
    if (!employeeId) {
        throw new ApiErrors(401, "Employee not authenticated.");
    }
    if (!scannedQrValue) {
        throw new ApiErrors(400, "QR code value is required.");
    }
    if (!deviceIp) {
        // This might indicate a missing middleware, but good to check
        throw new ApiErrors(500, "Device IP could not be determined.");
    }

    // 3. Get Today's Date Range (server-side for consistency)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 4. Validate the Scanned QR Code
    const todaysQrDocument = await DailyQr.findOne({
        qrId: scannedQrValue, // Match the scanned value
        createdAt: {
            $gte: startOfToday,
            $lte: endOfToday
        }
    });

    if (!todaysQrDocument) {
        throw new ApiErrors(400, "Invalid or expired QR code.");
    }

    // 5. Determine Punch Type (Check-in / Check-out)
    const lastPunchForToday = await PunchHistory.findOne({
        userId: employeeId,
        timestamp: { $gte: startOfToday, $lte: endOfToday }
    }).sort({ timestamp: -1 }); // Get the most recent punch

    let punchType;
    let message;

    if (!lastPunchForToday || lastPunchForToday.type === 'check-out') {
        // If no punches today, or last punch was a check-out, then it's a check-in
        punchType = 'check-in';
        message = 'Check-in successful!';
    } else { // lastPunchForToday.type === 'check-in'
        // If last punch was a check-in, then it's a check-out
        punchType = 'check-out';
        message = 'Check-out successful!';
    }

    // 6. Create and Save the New Punch History Record
    const newPunch = await PunchHistory.create({
        userId: employeeId,
        qrId: todaysQrDocument._id,
        deviceIp: deviceIp,
        timestamp: now,
        type: punchType
    });

    if (!newPunch) {
        throw new ApiErrors(500, "Failed to record attendance punch. Please try again.");
    }

    // 7. Send Success Response
    return res
        .status(200)
        .json(new ApiResponse(200, message, newPunch));
});

const getPunchHistory = asyncHandler(async(req,res)=>{

    
});



// Don't forget to export your route handler
export {
    createDailyQr,
    punchAttendance
};