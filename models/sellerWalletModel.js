const mongoose = require("mongoose")
const { Schema } = mongoose

const sellerWalletSchema = new Schema(
	{
		sellerId: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		month: {
			type: Number,
			required: true,
		},
		year: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
)

const SellerWallet = mongoose.model("sellerWallets", sellerWalletSchema)
module.exports = SellerWallet
