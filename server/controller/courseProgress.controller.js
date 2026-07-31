import User from "../models/user.model.js";
import Course from '../models/course.model.js'
import asyncHandler from "../utils/asyncHandler.js";
import AppError from '../utils/AppError.utils.js'
import LectureProgress from '../models/lectureProgress.model.js'
import CourseProgress from '../models/courseProgress.js'
import Course from '../models/course.model.js'

export const lectureProgress = asyncHandler(async (req, res) => {
    const lectureId = req.params.id || req.body.id
    const courseId = req.params.id
    const userId = req.user.id

    const {isCompleted} = req.body

    let lectureProgress =  await LectureProgress.findOne({
        lecture: lectureId,
        user: userId,
        course: courseId
      })

  
    if(!lectureProgress){
      lectureProgress = await LectureProgress.create({
            lecture: lectureId,
            isCompleted: isCompleted,
            user: userId,
            course: courseId
        })
    }else{
        lectureProgress.isCompleted = isCompleted
        await lectureProgress.save({validateBeforeSave: false})
    }

    const courseProgress = await CourseProgress.findOne({
          user: userId,
          course: courseId
    })
    if(!courseProgress){
      let progress =  await CourseProgress.create({
            user: userId,
            course: courseId,
            isCompleted = false
        })
       progress.lectureProgress.push(lectureProgress)
       await progress.save()

    }

    return res.status(200).json({
        success: true,
        message: "Lecture completed",
        lectureProgress
    })


 })


 export const courseProgress = asyncHandler(async(req, res) => {
    const courseId = req.params.id
    const userId = req.user.id

    const courseProgress = await CourseProgress.findOne({
           user: userId,
          course: courseId
    }).populate(lectureProgress)

    const course = await Course.findById(courseId)

    const totalLectures = course?.totalLectures || 0

    const totalLectureCompleted = courseProgress?.lectureProgress.filter((lp) => lp.isCompleted === true).length
    const completionPercentage =  Math.round(((totalLectureCompleted / totalLectures) * 100))

    courseProgress?.completionPercentage = completionPercentage
    await courseProgress.save()

    return res.status(200).json({
        success: true,
        message: "Course Progress",
        courseProgress
    })


 })