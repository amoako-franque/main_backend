const mongoose = require("mongoose")
const Schema = mongoose.Schema

const sellerSchema = new Schema(
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
		role: {
			type: String,
			default: "seller",
		},
		status: {
			type: String,
			default: "inactive",
		},
		payment: {
			type: String,
			default: "pending",
		},
		method: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			default: "",
		},
		shopInfo: {
			type: Object,
			default: {},
		},
	},
	{ timestamps: true }
)

sellerSchema.index(
	{
		name: "text",
		email: "text",
	},
	{
		weights: {
			name: 5,
			email: 4,
		},
	}
)

const Seller = mongoose.model("sellers", sellerSchema)
module.exports = Seller
