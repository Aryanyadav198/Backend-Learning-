import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createDailyQr, punchAttendance } from "../controllers/attendance.controllers.js";

const router = Router();

router.route("/daily_qr").post(verifyJwt,createDailyQr);
router.route("/punch-attendance").post(verifyJwt,punchAttendance);


export default router;