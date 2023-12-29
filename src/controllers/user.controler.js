import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import { uplodeONCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validiteBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while genrating refresh and Access token "
    );
  }
};

// register user

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

  //   console.log("email:", email);

  //validation -not empty
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all feild are required");
  }

  // check if user is allready exist: username or email
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User is already exist");
  }

  //   console.log(req.f);

  // uplode image
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverimageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avtar file is required");
  }

  //uplode them into cloudnary
  const avatar = await uplodeONCloudinary(avatarLocalPath);
  const coverImage = await uplodeONCloudinary(coverimageLocalPath);

  //check avatar hai ya nahi

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // create user object in database

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullname,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // jo jo chej humko nahi chiaye
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // check the user reqister user
  if (!createUser) {
    throw new ApiError(500, "Somthing Went wrong while reqister the user");
  }
  // user register successfully

  return res
    .status(201)
    .json(new ApiResponse(200, createUser, "User Resgister Successfully"));
});

// login the user
const loginUser = asyncHandler(async (req, res) => {
  //req body se data
  //username or email
  //find the user
  //password check
  //access and refress token
  //send cookies

  const { email, username, password } = req.body;

  // check user
  if (!username || !email) {
    throw new ApiError(400, "user name and email is required");
  }
  // find the user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  // if not find the user then thro the error
  if (!user) {
    throw new ApiError(404, "User is not Exist");
  }

  // check password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user password");
  }
  // generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  // store the cookie in client side

  const loggedInUser = User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

//logout user
const logoutUser = asyncHandler(async (req, res) => {
  // revoking the current token
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user LoggedOut"));
});

export { registerUser, loginUser, logoutUser };
