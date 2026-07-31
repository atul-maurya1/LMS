import express from 'express'

const userRoutes = express.Router()
import isLoggedIn from '../middlewares/auth.middleware.js'


import {
    getProfile,
    updateProfilePic,
    updateDetails,
    coursesList, 
    getCourseDetails, 
    getCourseLectures,
    getEnrolledCourses,
    getMyCreatedCourses

} from '../controller/user.controller.js'

userRoutes.get('/profile', isLoggedIn, getProfile)
userRoutes.patch('/update-profile-pic', isLoggedIn, updateProfilePic)
userRoutes.patch('/update-details', isLoggedIn, updateDetails)
userRoutes.get('/courses', coursesList)
userRoutes.get('/course-details/:id', getCourseDetails) 
userRoutes.get('/course-lecture/:id', isLoggedIn, getCourseLectures)
userRoutes.get('/enrolled-course', isLoggedIn, getEnrolledCourses)
userRoutes.get('/my-created-course', isLoggedIn, getMyCreatedCourses)


export default userRoutes