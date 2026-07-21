import {Course} from '../models/course.model.js'
import AppError from '../utils/AppError.utils.js'
import fs from 'fs'
import cloudinary from 'cloudinary'
import asyncHandler from '../utils/asyncHandler.js'

export const createCourse = asyncHandler(async (req, res) => {
	// only INSTRACTOR
	const instructor = req.user.id;
	const {
		title,
		subtitle,
		description,
		category,
		level = "beginner",
		price,
    isPublished
	} = req.body;
	
	if (
		!title?.trim() ||
		!subtitle?.trim() ||
		!description?.trim() ||
		!category?.trim() ||
		!level?.trim()
	) {
		throw new AppError("All fields are required ", 400);
	}

  const priceInNumber = Number(price);

	if (Number.isNaN(priceInNumber) || priceInNumber <= 0 ) {
		throw new AppError("please enter valid price", 400);
	}

	if (!req.file) {
		throw new AppError("please choose course cover image ", 400);
	}

	const result = await cloudinary.uploader.upload(req.file.path, {
		folder: "lms",
	});

	const thumbnail = {
		public_id: result.public_id,
		secure_url: result.secure_url,
	};

	const course = await Course.create({
		title,
		subtitle,
		description,
		category,
		level,
		price: priceInNumber,
		thumbnail,
		instructor,
    isPublished
	});
 

	return res.status(201).json({
		success: true,
		message: "Course Created Successfully",
		data: course,
	});
});









  













export const getLecturesByCourseId = async (req, res, next) => {
   const {id} = req.params // getting id from the url
   console.log("course id is: ", id)
  try{
     const course  = await Course.findById(id) 
     if(!course){
        return next (new AppError('course not found', 400))
     }  

     res.status(200).json({
        success: true,
        message: 'course found successfully',
        course
     })
  }catch(e){
    return next(new AppError(e.message, 400))
  }

}





export const updateCourse = async(req, res, next) => {
   //   console.log(req.body)
    const {id} = req.params
    console.log("update course: ", id)

    const{title, decription, category} = req.body
      
        const course = await Course.findById(id)
        if(!course){
            return next(new AppError('course not found', 400))
        } 
          
            course.title = title
            course.decription = decription
            course.category = category

           if(req.file){
             if(course.thumbnail?.public_id){
               await cloudinary.v2.uploader.destroy(course.thumbnail.public_id)
            }
          try{
              const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
              })

              console.log("result is: ", result)

              course.thumbnail = {
                public_id: result.public_id,
                secure_url: result.secure_url
            }

            fs.rmSync(`uploads/${req.file.filename}`);

            }catch(e){
               return next(new AppError(e.message, 400))
            }
        }
        
          await course.save()
          res.status(200).json({
                seccess: true,
                message: 'course updated successfully',
                course
            })
}




export const removeCourse = async (req, res, next) => {

  console.log("delete course")
  const{id} = req.params

  try{
    const course = await Course.findByIdAndDelete(id)
    if(!course){
      return next(new AppError('course not found by id', 400))
    }

    res.status(200).json({
      success: true,
      message: 'course deleted successfully'
    })

  }catch(e){
    return next (new AppError('e.message', 400))
  }

}

// add course lecture in course  
export const addLectureToCourseById = async (req, res, next) => {
  
  try{
    const{id} = req.params
    console.log("add lecture id is: ", id)
    const{title, decription} = req.body
   // console.log(req.body)
   if(!title || !decription){
    return next(new AppError('all fields mandatory', 400))
   }

   const course = await Course.findById(id)
  // console.log("course is", typeof course)

   if(!course){
    return next(new AppError('course not found ', 500))
   }

   const lectureData = {
    title,
    decription,
    lecture: {}
    
   }
 // console.log("data is: ", lectureData)

  if(req.file){
     console.log("file is: ", req.file)  
     
       try{
              const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                resource_type: "video"
              })

              console.log("result is: ", result)

               if(result) {
               lectureData.lecture.public_id = result.public_id,
                lectureData.lecture.secure_url =result.secure_url
            }

            fs.rmSync(`uploads/${req.file.filename}`);

            }catch(e){
               return next(new AppError(e.message, 400))
            }
        }
       
       // console.log(lectureData)
        course.lectures.push(lectureData)

        course.numberOfLectures =  course.lectures.length;


        await course.save();

        res.status(200).json({
          success: true,
          message: 'lecture is added in course successfully',
          course
        })


  }catch(e){
    return next(new AppError(e.message, 400))
  }
    

  }

// remove lecture from the course
export const deleteLecture = async(req, res, next) => {
  try{
    const {courseId, lectureId} = req.params
    console.log(req.params)
  
     const course = await Course.findById(courseId)
       if(!course){
        // console.log("course is : ", course)
      return next(new AppError('course not found', 400))
    }

     course.lectures = course.lectures.filter(lecture => lecture._id.toString() !== lectureId)
   
     course.numberOfLectures = course.lectures.length;

     await course.save();


    res.status(200).json({
      success: true,
      message: 'lecture deleted successfully'
    })

  }catch(e){
    return next (new AppError(e.message, 500))
  }
}
