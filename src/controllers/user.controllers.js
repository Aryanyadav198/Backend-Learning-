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
    const findOne = User.findOne(
        {
            $or: [{
                userName: userName,
                email: email
            }]
        }
    );
    if (findOne) {
        throw new ApiErrors(409, null, "This name or userName of User already Existed")
    }
    // Storing Path of the image 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiErrors(400, null, "Avatar image is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiErrors(500, null, "Something went wrong while uploading the Image")
    }
    const user = User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    });
    // .select is use to extract all the given value 
    const createdUser = User.findById(user._id).select(
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