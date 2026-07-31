import express from 'express'

const courseProgressRoutes = express.Router()
import isLoggedIn from '../middlewares/auth.middleware.js'

import {lectureProgress, courseProgress} from '../controller/courseProgress.controller.js'

courseProgressRoutes.post('/course/l/:id', isLoggedIn, lectureProgress)
courseProgressRoutes.get('/course/:id', isLoggedIn, courseProgress)



export default courseProgressRoutes