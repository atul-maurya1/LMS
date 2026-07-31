import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadFile } from "../config/cloudinary.js";
import AppError from '../utils/AppError.utils.js'
// PROBLEM: Missing `import {Course} from '../models/course.model.js'`. The `Course` model is used in `coursesList` (line 77), `getCourseDetails` (line 107), `getCourseLectures` (line 130), and `getMyCreatedCourses` (line 183) but is never imported. This will crash with `ReferenceError: Course is not defined`.


export const getProfile = asyncHandler(async (req, res) => {
	const userId = req.user.id;
	const role = req.user.role;
	const user = await User.findById(userId).select("-password")

	res.status(200).json({
		success: true,
		message: "User details",
		data: {
			user
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
	const skip = (page - 1) * 10; // PROBLEM: Should be `(page - 1) * limit` not `(page - 1) * 10`. The `limit` variable exists (line 74) but is not used here. If user passes a custom limit, pagination will be wrong.

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
			totalPage: Math.ceil(totalCourse / limit), // PROBLEM: `totalCourse` is undefined at this point! It's being used before declaration. Should be `Math.ceil(course.length / limit)`. Also, `totalCourse` here represents only the current page count, NOT the total in the database. You need a separate `Course.countDocuments()` query for accurate pagination.
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
			totalEnrolledStudents: course.enrolledStudents || 0, // PROBLEM: `course.enrolledStudents` is an array (of ObjectIds), not a number. `|| 0` will never trigger because an empty array is truthy. Should be `course.enrolledStudents?.length || 0` to get the count.
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
	const course = await User.findById(userId).populate(enrolledCourse); // PROBLEM: `enrolledCourse` is not a string — it refers to the variable declared on line 165 (which hasn't been declared yet!). Should be `.populate('enrolledCourse')` (with quotes). This will crash with `ReferenceError: Cannot access 'enrolledCourse' before initialization`.
	
	let enrolledCourse = course?.enrolledCourse
	if(enrolledCourse.length === 0){
		throw new AppError("No Courses ", 404)
	}

	return res.status(200).json({
		success: true,
		message: "Enrolled course by students", 
		data:{
			enrolledCourse,
			totalEnrolledCourses: enrolledCourse.length
		}
	})

});


export const getMyCreatedCourses = asyncHandler(async(req, res) => {
	const myCourses = Course.find({instructor: req.user.id}).populate({ // PROBLEM: Missing `await`! Without `await`, `myCourses` is a Mongoose Query object (a Promise), NOT the actual results. `.length` on a Query object won't reflect the DB data. Should be `await Course.find(...)`.
		paht: "enrolledStudents", // PROBLEM: Typo! `paht` should be `path`. This option will be ignored and the populate won't work.
		select: "fullName, email, avatar" // PROBLEM: Wrong select syntax — comma inside the string doesn't work in Mongoose. Should be `"fullName email avatar"` (space-separated).
	})
	if(myCourses.length === 0){
		throw new AppError("No Course Created Yet", 404)
	}

	return res.status(200).json({
		success: true,
		message:" my created course fetched successfully",
		data: {
			myCourses,
			totalMyCourses: myCourses.length || 0
		}
	})
})