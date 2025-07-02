import { ApiErrors } from "../utils/api_errors.js";
import { asyncHandler } from "../utils/async_handler.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/api_response.js";




// Get user data from front-end
// validate data is not empty
// Check its user is already exist : username , email
// check avatar is  uploaded successfully on cloudinary
// Create a user object in db
// return res and before this filter the response 

const registerUser = asyncHandler(async (req, res) => {

    const { userName, email, fullName, password } = req.body;

    if ([userName, email, fullName, password].some((field) => !field?.trim())) {
        throw new ApiErrors(400, null, "All Fields are required");
    }

    // Use this type of syntax if you have to check multiple field are present or not in db
    const isDuplicate = await User.findOne({
        $or: [{ userName }, { email }]
    });
    if (isDuplicate) {
        if (isDuplicate.email === email) {
            throw new ApiErrors(409, "", null, "Email is already registered");
        }
        if (isDuplicate.userName === userName) {
            throw new ApiErrors(409, "", null, "Username is already taken");
        }
        // Optional fallback
        throw new ApiErrors(409, "", null, "Email or username already in use");
    }
    

    // Storing Path of the image 
    const avatarFile = req.files?.avatar[0];
    const coverImageFile = req.files?.coverImage?.[0];

    if (!avatarFile?.path) {
        throw new ApiErrors(400, null, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarFile.path);
    const coverImage = coverImageFile ? await uploadOnCloudinary(coverImageFile.path) : null;

    if (!avatar) {
        throw new ApiErrors(500, null, "Something went wrong while uploading the Image")
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
        throw new ApiErrors(500, null, "Something want wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, "User Created Successfully", createdUser)
    )





});


export { registerUser };