const mongoose = require("mongoose")
const { Schema } = mongoose

const cartSchema = new Schema(
	{
		userId: {
			type: Schema.ObjectId,
			required: true,
		},
		productId: {
			type: Schema.ObjectId,
			required: true,
		},
		quantity: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
)

const Cart = mongoose.model("cart", cartSchema)
module.exports = Cart
