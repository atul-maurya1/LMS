import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cloudinary from 'cloudinary'
import rateLimit from 'express'
import halmet from 'helmet'
import hpp from 'hpp'


import connectDb from './config/dbConfig.js'
import authRoutes from './routes/auth.routes.js'
import courseRoutes from './routes/course.routes.js'
import {errorMiddleware} from './middlewares/error.middlewares.js'
import userRoutes from './routes/user.routes.js'

const app = express()

//Global rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  //15 minutes
    limit: 100, // Limit each IP to 100 request per window (per 15 minutes)
    message: "Too many request from this IP, please try later"
})

// Security Middleware
app.use(halmet())
app.use(hpp())
app.use('/api', limiter)


app.use(morgan('dev')) // middleware that log the http request


connectDb()

// body parser
app.use(express.urlencoded({ extended: true, limit: "15kb" }));
app.use(express.json({limit: '15kb'}))
app.use(cookieParser())

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentails: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    // allowHeaders: [
    //     "Content-Type",
    //     "Authorization",
    //     "X-Requested-With",
    //     "Accept",
    //     "Origin"
    // ]
}))

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


// routes of 3 modules
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/course', courseRoutes)

     
app.use( (req, res) => {
    res.status(404).json({
        status: "error",
        message: "OOPs ! 404 page not found"
    })
})
 
app.use(errorMiddleware)

export default app