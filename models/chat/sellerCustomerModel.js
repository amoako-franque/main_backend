const mongoose = require("mongoose")
const { Schema } = mongoose

const sellerCustomerSchema = new Schema(
	{
		myId: {
			type: String,
			required: true,
		},
		myFriends: {
			type: Array,
			default: [],
		},
	},
	{ timestamps: true }
)

const SellerCustomer = mongoose.model("seller_customers", sellerCustomerSchema)
module.exports = SellerCustomer
