const mongoose = require("mongoose")
const { Schema } = mongoose

const sellerCustomerMsgSchema = new Schema(
	{
		senderName: {
			type: String,
			required: true,
		},
		senderId: {
			type: String,
			required: true,
		},
		receiverId: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			default: "unseen",
		},
	},
	{ timestamps: true }
)

const SellerCustomerMessage = mongoose.model(
	"seller_customer_messages",
	sellerCustomerMsgSchema
)
module.exports = SellerCustomerMessage
