import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ ValidityBeforeSave: false })
    //The above line will save the refreshToken into the database without any validation


    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}



const registerUser = asyncHandler(async (req, res) => {
  /*
  // Algorithm or steps to create a new user
   > get user details from frontend
   > Validation - not empty
   > check if user already exists: username, email
   > check for images, check for avatar
   > upload them to cloudinary, avatar
   > create user object - create entry in db
   > remove password and refresh token field from response
   > check for user creation
   > return res
*/

  const { fullName, email, username, password } = req.body
  // console.log("email", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
  }

  //refer to chai aur code - complete backend course @9:09:21 to understand the avatar[0]
  //by default express give us the access to body in the same way multer gives access to files as we have defined multer middleware in user.routes.js to recieve files of format like images, videos etc
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //console.log(req.files);

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  //refer to chai aur code - complete backend course @9:14:21 to understand the await uploadOnCloudinary(avatarLocalPath)
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )


})


const loginUser = asyncHandler(async (req, res) => {
  /*
   //Algorithm or steps to login a existing user
   > req body - grab data
   > username or email
   > find user
   > password check
   > access and refresh token
   > send cookie
   > return res
  */

  const { email, username, password } = req.body

  if (!(email || username)) {
    throw new ApiError(400, "username or email is required")
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })
  //here in this user variable we dont have the accessToken & refreshToken. To get it we need to call the generateAccessAndRefreshTokens 

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  //in the .select() field we pass those fields that we don't want to send to the user for example we pass -password & -refreshToken(see the userSchema in user.model to confirm the selected fields)

  const options = {
    httpOnly: true,
    secure: true
  }
  // Using the httpOnly flag on cookies that store sensitive information, such as authentication tokens, is a crucial security practice. It prevents client-side scripts from accessing or modifying these cookies, thereby mitigating risks associated with XSS attacks and other forms of client-side manipulation

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged in successfully"
        /* In the context of mobile applications, the concept of cookies is not directly applicable as it is in web applications. Mobile apps typically use other methods for storing and managing authentication tokens and other data. Here's an overview of how token management and storage can be handled in mobile apps:-
        // Token Storage in Mobile Apps:
        1. Secure Storage
        2. Encrypted Storage
        3. Local Storage

        for the above reason we are sending the accessToken and refreshToken to the user 
        */
      )
    )
})


const logoutUser = asyncHandler((req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))

})


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )

    const user = User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message, "Invalid refresh token")
  }

})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
}