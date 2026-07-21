
//creating your own error class by extending JavaScript’s built-in Error class.

class AppError extends Error {
    constructor(message, statusCode) {
        super(message); //This calls the parent Error constructor.

        this.statusCode = statusCode

        Error.captureStackTrace(this, this.constructor)
    }
}

export default AppError