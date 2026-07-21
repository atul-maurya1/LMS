import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minLength: [3, "min length at least 3 chars"],
			maxLength: [25, "name should be less than 25 chars"],
		},

		email: {
			type: String,
			unique: true,
			trim: true,
			lowercase: true,
			required: [true, "email is required"],
			match: [ /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide a valid email"],
			index: true,
		},
		bio: {
			type: String,
			minLength: [100, "Only 100 character allowed"],
		},

		password: {
			type: String,
			required: [true, "Password is required"],
			minLength: [6, "Password must be at least 6 chars"],
			select: false,
		},

		avatar: {
			public_id: String,
			secure_url: String,
		},

		role: {
			type: String,
			enum: ["STUDENT", "INSTRUCTOR", "ADMIN"],
			default: "STUDENT",
		},
		
		enrolledCourse: [
			{
				course: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Course",
				},
				enrolledAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		createdCourse: [
			{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
		}
	],
		lastActive: {
			type: Date,
			default: Date.now,
		},
        refreshToken: {
			type: String,
			select: false
		},

		forgotPasswordToken: "String",
		forgotPasswordExpiry: Date,
	},
	{ timestamps: true },
);



userSchema.pre("save", async function () {
	if (!this.isModified("password")) {
		return;
	}
	this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.updateLastActive = function(){
    this.lastActive = Date.now()
     return this.save({ validateBeforeSave: false });
}

userSchema.virtual("totalEnrolledCourses").get(function(){
    return this.enrolledCourse?.length
})

userSchema.virtual("totalCourses").get(function(){
	return this.createdCourse?.length
})

userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			id: this._id,
			email: this.email,
			role: this.role,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: "1d" },
	);
};

userSchema.methods.generateRefreshToken = function(){
     return jwt.sign(
        {
            id: this._id,
            email: this.email,
			role: this.role,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
     )
}

userSchema.methods.generatePasswordResetToken = function () {
	const resetToken = crypto.randomBytes(20).toString("hex");

	this.forgotPasswordToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	this.forgotPasswordExpiry = Date.now() + 1 * 60 * 1000;

	return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
