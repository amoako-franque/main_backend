const mongoose = require("mongoose")
const { Schema } = mongoose

const stripeSchema = new Schema(
	{
		sellerId: {
			type: Schema.ObjectId,
			required: true,
		},
		stripeId: {
			type: String,
			required: true,
		},
		code: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
)

const Stripe = mongoose.model("stripes", stripeSchema)
module.exports = Stripe
