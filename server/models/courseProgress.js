import mongoose from "mongoose"

const courseProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User reference is required"]
    },
     course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Course reference is required"]
    },

    isCompleted: {
        type: Boolean,
        default: false
    },
    completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    lectureProgress: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LectureProgress",
        }
    ],
    lastAccessed: {
        type: Date,
        default: Date.now,
    }

}, {timestamps: true})

//calculate course completion
courseProgressSchema.pre('save', function(next){
    if(this.lectureProgress.length > 0){
        const completedLectures = this.lectureProgress.filter(lp => lp.isCompleted).length // PROBLEM (BUG-34 — HIGH): `this.lectureProgress` holds ObjectId references, NOT populated documents. `lp.isCompleted` is always `undefined` on an ObjectId, so `completedLectures` is always 0. Completion % is never computed correctly. Must populate or query LectureProgress separately.
        this.completionPercentage = Math.round((completedLectures / this.lectureProgress.length) * 100)
        this.isCompleted = this.completionPercentage === 100
    }
})

//update last accessed
courseProgressSchema.methods.updateLastAccessed = function(){
    this.lastAccessed = Date.now()
    return this.save({validateBeforeSave : false})
}

const CourseProgress  = mongoose.model('CourseProgress', courseProgressSchema)

export default CourseProgress