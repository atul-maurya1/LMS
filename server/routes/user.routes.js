import express from 'express'

const userRoutes = express.Router()
import isLoggedIn from '../middlewares/auth.middleware.js'


import {getProfile} from '../controller/user.controller.js'

userRoutes.get('/profile', isLoggedIn, getProfile)


export default userRoutes