import { ApiError } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  Jwt  from "jsonwebtoken";
import { User } from "../models/user.model";

export const verifyJwt = asyncHandler(async(req, _, next )=>{
  try {
    const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
  
    if (!token) {
      throw new ApiError(401,"Unauthrized error")
    }
  
    const decodedToken = Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
  
  
    if (!user) {
      throw new ApiError(401,"invalid Access Token")
    }
  
    req.user =user
    next()
  } catch (error) {
    throw new ApiError(401,error?.message || "Invaid access Token") 
    
  }
  

});
