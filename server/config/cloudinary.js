import cloudinary from 'cloudinary'
import 'dotenv/config'
import AppError from '../utils/AppError.utils.js'
import fs from 'fs/promises'

const connectCloudinary = () => {
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

}

export default connectCloudinary


export const uploadFile = async (localFile) => {
    try{

        const result = await cloudinary.v2.uploader.upload(localFile, {
            resource_type: "auto",
            folder: "lms"
        })
        fs.unlink(localFile)
        return result

    }catch(e){
         console.log("error while uploading file ", e)
         throw new AppError("error while uploading file ", 400)
        
    }
}

