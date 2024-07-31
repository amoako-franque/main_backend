const mongoose = require("mongoose")
const { Schema } = mongoose

const withdrawSchema = new Schema(
	{
		sellerId: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			default: "pending",
		},
	},
	{ timestamps: true }
)

const WithDraw = mongoose.model("WithDraw", withdrawSchema)
module.exports = WithDraw
