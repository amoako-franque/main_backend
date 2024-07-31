const mongoose = require("mongoose")
const { Schema } = mongoose

const reviewSchema = new Schema(
	{
		productId: {
			type: Schema.ObjectId,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		rating: {
			type: Number,
			default: 0,
		},
		review: {
			type: String,
			required: true,
		},
		date: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
)

const Review = mongoose.model("reviews", reviewSchema)
module.exports = Review
