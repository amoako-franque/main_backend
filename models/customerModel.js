const mongoose = require("mongoose")
const { Schema } = mongoose

const customerSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
		method: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
)

const Customer = mongoose.model("customers", customerSchema)
module.exports = Customer
