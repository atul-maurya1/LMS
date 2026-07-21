import User from '../models/user.model.js'
import asyncHandler from '../utils/asyncHandler.js'

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

})


export const updateDetails = asyncHandler(async(req, res) => {
  //name and bio
})

export const viewCourse =  asyncHandler(async(req, res) => {
  //without login
  //=> name, price, desciption, review syllbus, thumbnail, duration , short instructor details
})