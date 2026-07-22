import express from 'express'

const courseRoutes = express.Router()

import { createCourse, addLecture, getCourseDetails} from '../controller/course.controller.js'
import uplaod from '../middlewares/multer.middlewares.js'
import {isLoggedIn, authorizedRoles} from '../middlewares/auth.middleware.js'


courseRoutes
            .post('/create-course', isLoggedIn, authorizedRoles('INSTRUCTOR'), uplaod.single('thumbnail'),  createCourse)
            .post('/c/:id', isLoggedIn, authorizedRoles('INSTRUCTOR'), uplaod.single('lecture'), addLecture)
            .get('/:id' , getCourseDetails)


export default courseRoutes