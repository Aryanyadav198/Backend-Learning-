import { ApiErrors } from "../utils/api_errors.js";
import { asyncHandler } from "../utils/async_handler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api_response.js";
import { json } from "express";
import jwt from "jsonwebtoken";
import uploadOnCloudinary from "../utils/cloudinary.js";
// import { useR
// educer } from "react";

const generateRefreshAndAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiErrors(500, "Error while generating the Refresh and Access token")

    }
}
// Get user data from front-end
// validate data is not empty
// Check its user is already exist : username , email
// check avatar is  uploaded successfully on cloudinary
// Create a user object in db
// return res and before this filter the response 

const registerUser = asyncHandler(async (req, res) => {

    const { userName, email, fullName, password } = req.body;

    if ([userName, email, fullName, password].some((field) => !field?.trim())) {
        throw new ApiErrors(400, "All Fields are required");
    }

    // Use this type of syntax if you have to check multiple field are present or not in db
    const isDuplicate = await User.findOne({
        $or: [{ userName: userName }, { email: email }]
    });
    if (isDuplicate) {
        if (isDuplicate.email === email) {
            throw new ApiErrors(409, "Email is already registered");
        }
        if (isDuplicate.userName === userName) {
            throw new ApiErrors(409, "Username is already taken");
        }
        // Optional fallback
        throw new ApiErrors(409, "Email or username already in use");
    }


    // Storing Path of the image 
    const avatarFile = req.files?.avatar[0];
    const coverImageFile = req.files?.coverImage?.[0];

    if (!avatarFile?.path) {
        throw new ApiErrors(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarFile.path);
    const coverImage = coverImageFile ? await uploadOnCloudinary(coverImageFile.path) : null;

    if (!avatar) {
        throw new ApiErrors(500, "Something went wrong while uploading the Image")
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    });
    // .select is use to extract all the given value 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiErrors(500, "Something want wrong while registering the user")
    }


    return res.status(201).json(
        new ApiResponse(201, "User Created Successfully", { user: createdUser })
    )
});

const loginUser = asyncHandler(async (req, res) => {

    // Extract data for body
    // Check Data is valid 
    // Check in data Base user present 
    // Match the password
    // send access token and refresh token 

    console.log("Headers:", req.headers);
    console.log("Method:", req.method);
    console.log("Body:", req.body);
    const { userName, email, password } = req.body;

    if (!userName || !email) {
        throw new ApiErrors(400, "Enter valid userName or email is required");
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    });
    // console.log(user);

    if (!user) {
        throw new ApiErrors(404, "This userName or  email not exist  ")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiErrors(401, "Invalid user credential")
    }
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id);

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");



    const option = {
        httpOnly: true,
        secure: true
    };
    res
        .status(200)
        .cookie("AccessToken", accessToken, option)
        .cookie("RefreshToken", refreshToken, option)
        .json(new ApiResponse(200, "User LoggedIn Successfully", { user: loggedInUser, accessToken, refreshToken }))

});

const logOutUser = asyncHandler(async (req, res) => {

    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        );
        const option = {
            httpOnly: true,
            secure: true
        };
        res.clearCookie("accessToken", option);
        res.clearCookie("refreshToken", option);

        return res.status(200).json(new ApiResponse(200, "user loggedOut successfully", {}));

    } catch (error) {
        return ApiErrors(200, `Error is :${error.message}`);



    }

});

const refreshAccessToken = asyncHandler(async (req, res) => {

    const inComingRefreshToken = req.cookie?.refreshToken || req.body?.refreshToken;

    if (!inComingRefreshToken) {
        throw new ApiErrors(401, "Unauthorized Access: Refresh token required.");

    }
    try {
        const decodedToken = jwt.verify(inComingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiErrors(401, "Invalid refresh token or user not found.");
        }

        if (inComingRefreshToken !== user.refreshToken) {
            throw new ApiErrors(401, "Refresh token is invalid, expired, or already used. Please log in again.");
        }
        const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id);
        const option = {
            httpOnly: true,
            secure: true
        }
        return res
            .status(200) // 7. Changed to 200 OK for successful operation
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json(new ApiResponse(200, "Access Token Refreshed Successfully",
                { accessToken, refreshToken }
            ));
    } catch (error) {
        // 8. Specific error handling for JWT issues
        if (error.name === 'TokenExpiredError') {
            throw new ApiErrors(401, "Refresh token expired. Please log in again.");
        }
        if (error.name === 'JsonWebTokenError') {
            // Catches invalid signature, malformed token, etc.
            throw new ApiErrors(401, "Invalid refresh token. Please log in again.");
        }
        // Re-throw custom ApiErrors if they were already thrown
        if (error instanceof ApiErrors) {
            throw error;
        }
        // Fallback for any other unexpected errors
        throw new ApiErrors(500, `Internal Server Error: ${error.message}`);
    }

});

const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    console.log(`the changed password ${isPasswordCorrect}`);
    if (!isPasswordCorrect) { throw new ApiErrors(400, "Invalid oldPassword"); }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(

        new ApiResponse(200, "Password changed Successfully")

    );

});

const getUserProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user?._id).select("-password -refreshToken");
    res.status(200).json(new ApiResponse(200, "Current user ", user));

});

const updateUserAccount = asyncHandler(async (req, res) => {

    try {
        const { fullName, email } = req.body;
        if (!fullName || !email) {
            console.log(fullName, email);
            throw new ApiErrors(400, "FullName and email is Required");
        }


        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set: {
                    fullName,
                    email
                }
            },
            {
                new: true
            }
        ).select("-password -refreshToken");

        res.status(200)
            .json(new ApiResponse(200, "Account Updated Successfully", user))
    } catch (error) {
        throw new ApiErrors(400, `${error.message}`);
    }
});

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiErrors(400, "Avatar image is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar || !avatar.url) { // Added '!avatar' check for robustness
        throw new ApiErrors(400, "Error while uploading Avatar to cloud service."); // More descriptive error
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        }, {
        new: true
    }).select("-password -refreshToken");
    if (!user) {
        // This could happen if req.user?._id is invalid or user was deleted concurrently
        throw new ApiErrors(404, "User not found or update failed.");
    }

    return res.status(200).json(
        new ApiResponse(200, "Avatar updated successfully", user)
    );

});


export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changePassword,
    getUserProfile,
    updateUserAccount,
    updateUserAvatar
};