const mongoose = require("mongoose")
const { Schema } = mongoose

const categorySchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		slug: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
)

categorySchema.index({
	name: "text",
})

const Category = mongoose.model("categories", categorySchema)
module.exports = Category
