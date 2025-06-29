// Using try catch block

import { rejects } from "assert";
import { resolve } from "path";

// const asyncHandler = (fun) => async (req, res, next)=>{
//     try{
//        await fun(req,res,next)
//     }catch(error){
//         req.status(500).json({
//             success:false,
//             message:error.message,
//             data:[]
//         })
//     }
// }

// asyncHandler by using promise

const asyncHandler = (fun) => (req, res, next)=>{
    Promise.resolve(fun(req,res,next)).catch((error)=>next(error));
}
export {asyncHandler}
