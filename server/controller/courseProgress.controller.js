import User from "../models/user.model.js";
import {Course} from '../models/course.model.js'
import asyncHandler from "../utils/asyncHandler.js";
import AppError from '../utils/AppError.utils.js'
import LectureProgress from '../models/lectureProgress.model.js'
import CourseProgress from '../models/courseProgress.js'

export const lectureProgress = asyncHandler(async (req, res) => {
    const lectureId = req.params.id || req.body.id // PROBLEM: `req.params.id` is used for BOTH lectureId and courseId (line 10). They will always be the same value! There's no way to distinguish lecture vs course from a single `:id` param. The route needs separate params like `/course/:courseId/lecture/:lectureId`.
    const courseId = req.params.id // PROBLEM: Same `req.params.id` as lectureId above — both will always be identical. This is a route design flaw.
    const userId = req.user.id

    const {} = req.body // PROBLEM: Empty destructuring — this extracts nothing from req.body. Likely meant to destructure `{ isCompleted }` which is used on lines 25 and 30 but is never declared. This will cause `ReferenceError: isCompleted is not defined` at runtime.

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
            isCompleted: false
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
    }).populate(lectureProgress) // PROBLEM: `lectureProgress` is not a string here — it refers to the variable name of this function (from the export on line 8). Should be `.populate('lectureProgress')` (with quotes) to populate the field by name.

    const course = await Course.findById(courseId)

    const totalLectures = course?.totalLectures || 0

    const totalLectureCompleted = courseProgress?.lectureProgress.filter((lp) => lp.isCompleted === true).length
    const courseCompletionPercentage =  Math.round(((totalLectureCompleted / totalLectures) * 100)) // PROBLEM: Division by zero! If `totalLectures` is 0, this produces `NaN`. Should add a check: `totalLectures > 0 ? Math.round(...) : 0`.

    courseProgress.completionPercentage  = courseCompletionPercentage // PROBLEM: If `courseProgress` is null (no progress record found), this will crash with `TypeError: Cannot set properties of null`. No null check is performed after the findOne query on line 63.
    await courseProgress.save()

    return res.status(200).json({
        success: true,
        message: "Course Progress",
        courseProgress
    })


 })