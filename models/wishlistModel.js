const mongoose = require("mongoose")
const { Schema } = mongoose

const wishlistSchema = new Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		productId: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		slug: {
			type: String,
			required: true,
		},
		discount: {
			type: Number,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		rating: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
)

const Wishlist = mongoose.model("wishlist", wishlistSchema)
module.exports = Wishlist
