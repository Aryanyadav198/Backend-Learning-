import { ApiErrors } from "../utils/api_errors.js";
import { asyncHandler } from "../utils/async_handler.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/api_response.js";
import { json } from "express";


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


});



export { registerUser, loginUser, logOutUser };