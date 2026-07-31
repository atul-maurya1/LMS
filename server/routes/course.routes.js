import express from 'express'

const courseRoutes = express.Router()

import { createCourse, addLecture, deleteLecture, updateCourse, deleteCourse} from '../controller/course.controller.js'
import uplaod from '../middlewares/multer.middlewares.js'
import {isLoggedIn, authorizedRoles} from '../middlewares/auth.middleware.js' 

courseRoutes.post('/create-course', isLoggedIn, authorizedRoles('INSTRUCTOR'), uplaod.single('thumbnail'),  createCourse)
courseRoutes.post('/c/:id', isLoggedIn, authorizedRoles('INSTRUCTOR'), uplaod.single('lecture'), addLecture)
courseRoutes.delete('/delete-lecture/:id', isLoggedIn, authorizedRoles('INSTRUCTOR'), deleteLecture)
courseRoutes.patch('/update-course/:id', isLoggedIn, authorizedRoles('INSTRUCTOR'), updateCourse)
courseRoutes.delete('/course/:id',  isLoggedIn, authorizedRoles('INSTRUCTOR'), deleteCourse)

export default courseRoutes