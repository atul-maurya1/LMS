export const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Something went wrong!"

   return res.status(err.statusCode).json({
   
        success: false,
        message: err.message,
        stack: err.stack // PROBLEM: Stack trace is exposed in ALL environments including production. This is a security risk — attackers can see internal file paths and code structure. Should only include stack in development: `stack: process.env.NODE_ENV === 'development' ? err.stack : undefined`
    })
}