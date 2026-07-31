import mongoose from "mongoose"


const lectureProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },

    lecture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
        required: true,
    },

    isCompleted: {
        type: Boolean,
        default: false,
    },

    watchTime: {
        type: Number,
        default: 0,
    },

    lastWatched: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

lectureProgressSchema.index(
    { user: 1, lecture: 1 },
    { unique: true }
);

const LectureProgress = new mongoose.model('LectureProgress', lectureProgressSchema)

export default LectureProgress