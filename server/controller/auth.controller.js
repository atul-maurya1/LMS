import AppError from '../utils/AppError.utils.js'
import User from '../models/user.model.js'
import bcrypt from 'bcrypt'
import cloudinary from 'cloudinary'
import fs from 'fs'
import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto'
import asyncHandler from '../utils/asyncHandler.js'


const generateAccessTokenAndRefreshToken = async (userId) => {

  try{
    const user = await User.findById(userId)

   const refreshToken = user.generateRefreshToken()
   const accessToken = user.generateAccessToken()

   user.refreshToken = refreshToken
   await user.save({validateBeforeSave: false})

   return {accessToken, refreshToken}
  }catch(e){
   throw new AppError("token generation failed " ,500) 
  }

}


const cookieOption = {
    maxAge: 7*24*60*60*1000, // 7 days
    httpOnly: true,
    secure: true,
}


export const register =  asyncHandler(async (req, res ) => {
    const {fullName , email, role="STUDENT", password, confirmPassword} = req.body
  
    if(!fullName || !email || !password){
         throw new AppError('all fields are required', 400)
    }

    if(password !== confirmPassword){
      throw new AppError('password and confirmPassword is not same', 400)
    }

     const userExists = await User.findOne({email})
     if(userExists){
        throw new AppError('email is already registered', 400)
     } 

     const createdUser = await User.create({
        fullName,
        email,
        role,
        password
     })
    if(!createdUser){
          throw new AppError('registeration failed', 400)
     }
     const user = await User.findById(createdUser._id).select("-password")
     await user.updateLastActive()
     
     const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
     
     res.cookie('refreshToken', refreshToken, cookieOption )
     res.cookie('accessToken', accessToken, cookieOption)

     res.status(201).json({
        success: true,
        message: "user registred successfully",
        user,
     })
   }) 


export const login = asyncHandler(async (req, res) => {

    const {email, password} = req.body;

    if(!email || !password){
      throw new AppError('Email or password required', 400)
    }

    const user = await User.findOne({email}).select('+password')

    if(!user){
        throw new AppError('account not exists', 400)
    }

    if (!(await bcrypt.compare(password, user.password))) {
     throw new AppError('Incorrect password', 400)
   }

   const loggedInUser = await User.findById(user._id).select("-password, -refreshToken")
   await loggedInUser.updateLastActive()

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
     
     res.cookie('refreshToken', refreshToken, cookieOption )
     res.cookie('accessToken', accessToken, cookieOption)

     res.status(201).json({
        success: true,
        message: "user login successfully",
        user: loggedInUser,
     })
   })   




export const logout = asyncHandler( async (req , res) => {

   const user = await User.findById(req.user.id)
  
   user.refreshToken = ""
   await user.save({validateBeforeSave: false})
   
   res.clearCookie('accessToken', cookieOption)
   res.clearCookie('refreshToken', cookieOption)

      res.status(200).json({
         success: true,
         message: "User logged out seccessfully",
         user
      })
 })


export const forgotPassword = async (req, res , next) => {
  console.log(req.body)
   const {email} = req.body
   if(!email) {
      return next(new AppError('email is required', 400))
   }

   const user =await User.findOne({email})
  
   if(!user){
      return next (new AppError('email is not registered', 400))
   }

   const resetToken = await user.generatePasswordResetToken()
    console.log("toekn is1: ", resetToken); 
   await user.save({ validateBeforeSave: false });  // save without changes
   const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

  
  


     const message = `
      <h2>Password Reset</h2>
      <p>Click below link to reset password:</p>
      <a href="${resetPasswordURL}">${resetPasswordURL}</a>
   `;

   const subject = 'Password recovery'
    
   try{
      await sendEmail(email, subject, message)

      res.status(200).json({
         success: true,
         message: `Reset password token has been sent to ${email} successfully`
      })
   }catch(e){
          
      // In case of email sending fails due to any resaon, then do not save token details in db
      user.forgotPasswordExpiry = undefined
      user.forgotPasswordToken = undefined
      await user.save()

      return next (new AppError(e.message, 500))
   }
   
}


export const resetPassword = async (req, res, next) => {
      const {resetToken} = req.params
      console.log("token is: ",  req.params.token)


      const {password} = req.body
      if(!password){
         return next(new AppError('Please create new password', 400))
      }
     
      const forgotPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

      const user = await User.findOne({
         forgotPasswordToken,
         forgotPasswordExpiry: {$gt: Date.now()}     
      })

      if(!user) {
         return next( new AppError('Token is invalid, please try again', 400))
      }


      user.password = password
      user.forgotPasswordToken = undefined
      user.forgotPasswordExpiry =undefined
      user.save()

      res.status(200).json({
         success: true,
         message: 'Password changed successfully'
      })

}


export const changePassword = async (req, res, next) => {
   const{oldPassword, newPassword} = req.body
   const{id} = req.user // from auth details {jwt token}
  

   if(!oldPassword || !newPassword){
      return next (new AppError('fill all fields' ,400))
   }

   const user = await User.findById(id).select('+password')
   if(!user){
      return next(new AppError('user not exists', 400))
   }

   const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
   if(!isPasswordValid){
      return next(new AppError('incorrect old password', 400))
   }

   user.password = newPassword
   await user.save()
   user.password = undefined

   res.status(200).json({
      success: true,
      message: "Password Upadated successfully"
   })

}


