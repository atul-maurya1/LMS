import User from '../models/user.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import {uploadFile} from '../config/cloudinary.js'


export const getProfile = asyncHandler(async (req, res) => {
       const userId = req.user.id
       const role = req.user.role
       const user = await User.findById(userId).populate("createdCourse")
       res.status(200).json({
         success: true,
         message: "User details",
         data: { user,
         totalEnrolledCourses: user.totalEnrolledCourses || 0,
         totalCreatedCourse: user.totalCourses || 0
         }
       })
   }) 

export const updateProfilePic = asyncHandler(async(req, res) => {

  const userId = req.user.id

  if(!req.file){
    throw new AppError("please provide image" , 400)
  }

  const result = await uploadFile(req.file.path)
  if(!result){
    throw new AppError("file not uploaded ", 400)
  }

  const img = {
    public_id: result.public_id,
		secure_url: result.secure_url,
  }

  const user = await User.findByIdAndUpdate(userId, {
    $set: {avatar: img}
  })

  if(!user){
    throw new AppError("User not found ", 404)
  }

  return res.status(200).json({
    success: true,
    message: "Avatar img updated successfully",
    data: user
  })

})


export const updateDetails = asyncHandler(async(req, res) => {
  const userId = req.user.id

  const {fullName, bio} = req.body

  const user = await User.findByIdAndUpdate(userId, {
    $set: {fullName, bio}
  })

  if(!user){
    throw new AppError("User not found ", 404)
  }
  return res.status(200).json({
    success: true,
    message: "details updated successfully",
    data: user
  })

})

export const viewCourse =  asyncHandler(async(req, res) => {
  //without login
  //=> name, price, desciption, review syllbus, thumbnail, duration , short instructor details
})