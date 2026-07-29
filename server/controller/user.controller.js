import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadFile } from "../config/cloudinary.js";

export const getProfile = asyncHandler(async (req, res) => {
	const userId = req.user.id;
	const role = req.user.role;
	const user = await User.findById(userId).populate("createdCourse");
	res.status(200).json({
		success: true,
		message: "User details",
		data: {
			user,
			totalEnrolledCourses: user.totalEnrolledCourses || 0,
			totalCreatedCourse: user.totalCourses || 0,
		},
	});
});

export const updateProfilePic = asyncHandler(async (req, res) => {
	const userId = req.user.id;

	if (!req.file) {
		throw new AppError("please provide image", 400);
	}

	const result = await uploadFile(req.file.path);
	if (!result) {
		throw new AppError("file not uploaded ", 400);
	}

	const img = {
		public_id: result.public_id,
		secure_url: result.secure_url,
	};

	const user = await User.findByIdAndUpdate(userId, {
		$set: { avatar: img },
	});

	if (!user) {
		throw new AppError("User not found ", 404);
	}

	return res.status(200).json({
		success: true,
		message: "Avatar img updated successfully",
		data: user,
	});
});

export const updateDetails = asyncHandler(async (req, res) => {
	const userId = req.user.id;

	const { fullName, bio } = req.body;

	const user = await User.findByIdAndUpdate(userId, {
		$set: { fullName, bio },
	});

	if (!user) {
		throw new AppError("User not found ", 404);
	}
	return res.status(200).json({
		success: true,
		message: "details updated successfully",
		data: user,
	});
});

export const coursesList = asyncHandler(async (req, res) => {
	const page = Number(req.query.page) || 1;
	const limit = Number(req.query.limit) || 10;
	const skip = (page - 1) * 10;

	const course = await Course.find({ isPublished: true })
		.select("-lectures -enrolledStudents")
		.populate({
			path: "instructor",
			select: "fullName avatar",
		})
		.skip(skip)
		.limit(limit)
		.sort({ createdAt: -1 });

	if (course.length == 0) {
		throw new AppError("No Course Available", 404);
	}

	return res.status(200).json({
		success: true,
		message: "Course List fetched successfully",
		data: {
			course,
			limit,
			page,
			totalCourse: course?.length,
			totalPage: Math.ceil(totalCourse / limit),
		},
	});
});

// view course by id may be without login
export const getCourseDetails = asyncHandler(async (req, res) => {
	const courseId = req.params.id;
	const course = await Course.findById(courseId)
		.select("-lectures")
		.populate({
			path: "instructor",
			select: "fullName bio avatar",
		});
	if (!course) {
		throw new AppError("Course not found ", 404);
	}

	return res.status(200).json({
		success: true,
		message: "Course view",
		data: {
			course,
			totalEnrolledStudents: course.enrolledStudents || 0,
		},
		//averageRating
	});
});

export const getCourseLectures = asyncHandler(async(req, res) => {

  const course = await Course.findById(req.params.id).populate({
    path: "lectures",
    select: "title description videoUrl duration isPreview order"
  }).sort({order: 1})

  if(!course){
    throw new AppError("Course not found ", 404)
  }

  const isEnrolled = course.enrolledStudents.includes(req.user.id)
  const isInstructor = course.instructor.toString() === req.user.id

  let lectures = course.lectures
  if(!isEnrolled && !isInstructor){
    // if student not enrolled and instructor is not them show only some lec. which is preview
    lectures = lectures.filter((lec) => lec.isPreview)
  }

  return res.status(200).json({
    success: true,
    message: "lecture fetched successfully",
    data: {
      lectures,
      isEnrolled,
      isInstructor
    }
  })
  
})

//student
export const getEnrolledCourses = asyncHandler(async (req, res) => {
	const userId = req.user.id;
	const course = await User.findById(userId).populate(enrolledCourse);
});
