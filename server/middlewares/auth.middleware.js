import AppError from '../utils/AppError.utils.js'
import jwt from 'jsonwebtoken'
import asyncHandler from '../utils/asyncHandler.js'


export const isLoggedIn = asyncHandler(async (req, res, next) => {
   const { accessToken } = req.cookies
   if (!accessToken) {
      throw new AppError('Unauthenticated, please login', 401) 
   }

   const userDetails = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

   req.user = userDetails;
   next()
})

// ...roles => rest parameter; returns a middleware factory for Express.
export const authorizedRoles = (...roles) => asyncHandler(async (req, res, next) => {
   const currentUserRoles = req.user.role;

   if (!roles.includes(currentUserRoles)) {
      return next(new AppError("you are not authorized", 403));
   }

   next();
})
