import {Course} from '../models/course.model.js'
import AppError from '../utils/AppError.utils.js'
import fs from 'fs'
import {uploadFile} from '../config/cloudinary.js'
import asyncHandler from '../utils/asyncHandler.js'
import User from '../models/user.model.js'
import {Lecture} from '../models/lecture.model.js'

	// only INSTRACTOR
export const createCourse = asyncHandler(async (req, res) => {
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

	const result = await uploadFile(req.file.path)

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

  await User.findByIdAndUpdate(instructor, {
    $push: {createdCourse: course._id}
  })
 
//  const user = await User.findById(instructor)
//  user.createdCourse.push(course._id)
//  await user.save()

	return res.status(201).json({
		success: true,
		message: "Course Created Successfully",
		data: course,
	});
});


// only INSTRACTOR
export const updateCourse = asyncHandler(async(req, res) => {
    const courseId = req.params // PROBLEM: This assigns the ENTIRE `req.params` object (e.g. `{id: '123'}`) to `courseId`, NOT the ID string. Should be `req.params.id`. Passing an object to `findByIdAndUpdate` will fail or produce unexpected behavior.
   	const {
		title,
		subtitle,
		description,
		price,
	} = req.body;

  const updatedCourse = await Course.findByIdAndUpdate(courseId, {
    title,
		subtitle,
		description,
		price,
  },{new : true})

  if(!updatedCourse){
    throw new AppError("Course not found ", 404)
  }

  return res.status(200).json({
    success: true,
    message: "Course updated successfully",
    data: updatedCourse
  })

})

// only INSTRACTOR
export const deleteCourse = asyncHandler(async(req, res) => {
  const courseId = req.params.id

  const course = await Course.findByIdAndDelete(courseId)
  if(course){ // PROBLEM: Logic is INVERTED! This throws "Course not found" when the course IS found (successfully deleted). Should be `if(!course)` to handle the case where the course doesn't exist.
    throw new AppError("Course not found ", 404)
  }
  return res.status(200).json({
    success: true,
    message: "Course deleted Successfully",
    data: course
  })
  
})


// add lecture
export const addLecture = asyncHandler(async(req, res) => {
   
  const courseId = req.params.id
   const course = await Course.findById(courseId)
   
   if(!course){
     throw new AppError("course not found ", 404)
   }

   const {title, description, isPreview} = req.body
   if(!title || !description){
    throw new AppError("title and description are required ", 400)
   }

   if(!req.file){
    throw new apiError("please choose lecture video") // PROBLEM: `apiError` is undefined! Should be `AppError` (which is the imported error class). Also missing the status code parameter. This will crash with `ReferenceError: apiError is not defined`.
   }
   
   const result = await uploadFile(req.file.path)
   
   const lecture = await Lecture.create({
       title,
       description,
       isPreview,
       videoUrl: result?.secure_url,
       publicId: result?.public_id,
       duration: result?.duration,
       order: course.lectures.length + 1
   })
   if(!lecture){
    throw new AppError("Error while adding lecture ", 400)
   }
   course.lectures.push(lecture._id)
   course.totalDuration +=result?.duration
   await course.save({validaitonBeforeSave: false}) // PROBLEM: Typo in option name — `validaitonBeforeSave` should be `validateBeforeSave`. Because of this typo, the option is ignored and validation WILL run (which may actually be fine, but it's not the developer's intent).

  return res.status(200).json({
    success: true,
    message: "lecture added seccussfully",
    data: lecture
  })
  

})

export const deleteLecture = asyncHandler(async(req, res) => {
   const {lectureId} = req.body.id || req.params.id // PROBLEM: This destructures `lectureId` from a string (`req.body.id` or `req.params.id`), which will always be `undefined`. Should be `const lectureId = req.body.id || req.params.id`. Also, the deleted lecture is not removed from the parent Course's `lectures` array — orphaned reference will remain.
   const userId = req.user._id // PROBLEM: `req.user._id` may not exist. The auth middleware sets `req.user = userDetails` from JWT payload which has `id`, not `_id`. Should be `req.user.id`. Also, `userId` is declared but never used in this function.

   const lecture = await Lecture.findByIdAndDelete({_id: lectureId})
   if(!lecture){
    throw new AppError("problem in lecture detetion ", 400)
   }

   return res.status(200).json({
    success: true,
    message: "lecture deleted successfully",
    data: lecture
   })

})






  









