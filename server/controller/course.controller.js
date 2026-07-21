import {Course} from '../models/course.model.js'
import AppError from '../utils/AppError.utils.js'
import fs from 'fs'
import cloudinary from 'cloudinary'
import asyncHandler from '../utils/asyncHandler.js'

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


// only INSTRACTOR
export const updateCourse = asyncHandler(async(req, res) => {
    const courseId = req.params
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
  const courseId = req.params

  const course = await Course.findByIdAndDelete(courseId)
  if(course){
    throw new AppError("Course not found ", 404)
  }
  return res.status(200).json({
    success: true,
    message: "Course deleted Successfully",
    data: course
  })
  
})








  









