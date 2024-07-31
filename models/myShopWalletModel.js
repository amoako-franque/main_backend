const mongoose = require("mongoose")
const { Schema } = mongoose
const myShopWalletSchema = new Schema(
	{
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

const MyShopWallet = mongoose.model("myShopWallets", myShopWalletSchema)
module.exports = MyShopWallet
