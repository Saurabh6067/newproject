import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import { uplodeONCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser = asyncHandler(async (req, res) => {
  //get user deatail from frontend
  //validation -not empty
  // check if user is allready exist: username or email
  //check form images
  //check for avtar
  //uplode the cloudnary,avtar
  //create a user object -create entry in db
  // remove password and requst token feild
  //check for user creation
  //return response

    // get data from user 
  const { username, email, fullname, password } = req.body;

  console.log("email:", email);

  //validation -not empty
  if ([fullname, email, username, password].some(() => field?.trim() === "")) {
    throw new ApiError(400, "all feild are required");
  }

  // check if user is allready exist: username or email
  const existedUser = User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User is already exist");
  }

// uplode image 

 const avatarLocalPath = req.files?.avatar[0]?.path
 const coverimageLocalPath = req.files?.avatar[0]?.path

 if (!avatarLocalPath) {
    throw new ApiError(400,"Avtar file is required")
 }

 //uplode them into cloudnary
const avatar =await uplodeONCloudinary(avatarLocalPath)
const coverImage =await uplodeONCloudinary(coverimageLocalPath)

//check avatar hai ya nahi 

if (!avatar) {
    throw new ApiError(400, "Avatar is required")
}

// create user object in database 

const user =await User.create({
    username: username.toLowerCase(),
    email,
    fullname,
    password,
    avatar: avatar.url,
    coverImage : coverImage?.url || "",
})

// jo jo chej humko nahi chiaye 
const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
)
// check the user reqister user 
if (!createUser) {
    throw new ApiError(500,"Somthing Went wrong while reqister the user")
    
}
// user register successfully

return res.status(201).json(
    new ApiResponse(200, createUser,"User Resgister Successfully")
);

 


});

export { registerUser };
