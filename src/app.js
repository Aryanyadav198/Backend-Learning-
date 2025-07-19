import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();
// Middle wares
app.use(cors({
    origin: process.env.CORSE_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/async-error", async (req, res, next) => {
    try {
        await Promise.reject(new Error("Async Error Occured"))

    } catch (err) {
        next(err);

    }
});
app.get("/get-ip", async (req, res, next) => {
    try {
        res.status(200).json(new ApiResponse(200,"This is your ip",req.ip))

    } catch (err) {
        next(err);

    }
});





// import userRouter
import userRouter from "./routes/user.routers.js";
import { ApiErrors } from "./utils/api_errors.js";
import attendanceRouter from "./routes/attendance.router.js"
import { ApiResponse } from "./utils/api_response.js";

// Declaring UserRouter

app.use("/api/v1/users", userRouter);
app.use("/api/v1/attendance",attendanceRouter);


// Global error handler

app.use((err, req, res, next) => {
    const statusCode = err.statuscode  || 500;
    console.error("Caught by global error handler:\n", err.message);
    res.status(statusCode).json({
        success: false,
        message: `Oops! : ${err.message}`,
        data: {}
    });
});
export { app }