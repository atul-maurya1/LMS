import express from 'express'

const courseRoutes = express.Router()

import {getAllCourse, getLecturesByCourseId, createCourse, updateCourse, removeCourse, addLectureToCourseById, deleteLecture} from '../controller/course.controller.js'
import uplaod from '../middlewares/multer.middlewares.js'
import {isLoggedIn, authorizedRoles} from '../middlewares/auth.middleware.js'


courseRoutes.post('/create-course', isLoggedIn, authorizedRoles('INSTRUCTOR'), uplaod.single('thumbnail'),  createCourse)
courseRoutes.get('/', getAllCourse)
courseRoutes.get('/:id', isLoggedIn, getLecturesByCourseId)

courseRoutes.put('/update/:id', isLoggedIn, authorizedRoles('ADMIN'), uplaod.single('thumbnail'), updateCourse)
courseRoutes.delete('/:id', isLoggedIn, authorizedRoles('ADMIN'), removeCourse)

courseRoutes.post('/:id', isLoggedIn, authorizedRoles('ADMIN'), uplaod.single('lecture'),  addLectureToCourseById)
courseRoutes.delete('/:courseId/lectures/:lectureId', isLoggedIn, authorizedRoles('ADMIN'), deleteLecture)


export default courseRoutes