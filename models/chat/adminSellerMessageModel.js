const mongoose = require("mongoose")
const { Schema } = mongoose
const adminSellerMsgSchema = new Schema(
	{
		senderName: {
			type: String,
			required: true,
		},
		senderId: {
			type: String,
			default: "",
		},
		receiverId: {
			type: String,
			default: "",
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

const AdminSellerMessage = mongoose.model(
	"seller_admin_messages",
	adminSellerMsgSchema
)
module.exports = AdminSellerMessage
