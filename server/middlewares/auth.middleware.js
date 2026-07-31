import AppError from '../utils/AppError.utils.js'
import jwt from 'jsonwebtoken'

export const isLoggedIn = async (req, res, next) => {
     const {accessToken} = req.cookies
     if(!accessToken){
        throw new AppError('Unauthenticated, please login' , 400) // PROBLEM: Throwing inside an async function without try-catch means this becomes an unhandled rejected promise. Express 4 won't catch async errors automatically — you need `asyncHandler` wrapper or try-catch with `next(err)`. This will crash the server with UnhandledPromiseRejection. Also, HTTP status should be 401 (Unauthorized), not 400.
     }

     const userDetails = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

     req.user = userDetails;
     next()
}

// ...roles => rest parameter, It collects multiple arguments into an array.
export const authorizedRoles = (...roles) => async (req, res, next) => {
   const currentUserRoles = req.user.role;
   if(!roles.includes(currentUserRoles)){
      return next(new AppError("you are not authorized", 402)) // PROBLEM: HTTP 402 is "Payment Required" — wrong status code. Should be 403 (Forbidden) for authorization failures.
   }
  next()
}


export default isLoggedIn 