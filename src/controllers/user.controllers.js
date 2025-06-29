import {asyncHandler} from "../utils/async_handler.js";


const registerUser = asyncHandler(async (req , res)=>{

    // throw new Error("this is from register user");
    
    res.status(200).json({
        success:true,
        message:"OK",
        data:{}
    });

});

export {registerUser};