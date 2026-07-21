import AppError from '../utils/AppError.utils.js'
import jwt from 'jsonwebtoken'

export const isLoggedIn = async (req, res, next) => {
     const {accessToken} = req.cookies
     if(!accessToken){
        throw new AppError('Unauthenticated, please login' , 400)
     }

     const userDetails = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

     req.user = userDetails;
     next()
}

// ...roles => rest parameter, It collects multiple arguments into an array.
export const authorizedRoles = (...roles) => async (req, res, next) => {
   const currentUserRoles = req.user.role;
   if(!roles.includes(currentUserRoles)){
      return next(new AppError("you are not authorized", 402))
   }
  next()
}


export default isLoggedIn 