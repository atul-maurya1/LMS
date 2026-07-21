import express from 'express'

const authRoutes = express.Router()

import {register, login, logout,  forgotPassword, resetPassword, changePassword, } from '../controller/auth.controller.js'
import isLoggedIn from '../middlewares/auth.middleware.js'
import uplaod from '../middlewares/multer.middlewares.js'

 authRoutes.post('/register',  register)
authRoutes.post('/login', login)
authRoutes.post('/logout', isLoggedIn, logout)

authRoutes.post('/forgot-password', forgotPassword)
authRoutes.post('/reset-password/:resetToken', resetPassword)
authRoutes.post('/change-password', isLoggedIn, changePassword)





export default authRoutes