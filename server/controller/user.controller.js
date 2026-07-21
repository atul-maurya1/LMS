import User from '../models/user.model.js'
import asyncHandler from '../utils/asyncHandler.js'

export const getProfile = asyncHandler(async (req, res) => {
       const userId = req.user.id
       const user = await User.findById(userId).select("-refreshToken").populate("createdCourse")
       res.status(200).json({
         success: true,
         message: "User details",
         user,
         totalEnrolledCourses: user.totalEnrolledCourses || 0
       })
   }) 

export const updateProfilePic = asyncHandler(async(req, res) => {

})


export const updateDetails = asyncHandler(async(req, res) => {
  //name and bio
})

export const viewCourse =  asyncHandler(async(req, res) => {
  //without login
  //=> name, price, desciption, review syllbus, thumbnail, duration , short instructor details
})