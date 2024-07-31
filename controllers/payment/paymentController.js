const Seller = require("../../models/sellerModel")
const Stripe = require("../../models/stripeModel")
const SellerWallet = require("../../models/sellerWalletModel")
const WithdrawRequest = require("../../models/withdrawRequestModel")
const { v4: uuidv4 } = require("uuid")
const { responseReturn } = require("../../utils/response")
const {
	mongo: { ObjectId },
} = require("mongoose")
const stripe = require("stripe")(process.env.STRIPE_KEY)

exports.createStripeConnectAccount = async (req, res) => {
	const { id, role } = req.auth

	const uid = uuidv4()

	try {
		const stripeInfo = await Stripe.findOne({ sellerId: id })

		if (stripeInfo) {
			await Stripe.deleteOne({ sellerId: id })
			const account = await stripe.accounts.create({ type: "express" })

			const accountLink = await stripe.accountLinks.create({
				account: account.id,
				refresh_url: "http://localhost:3001/refresh",
				return_url: `http://localhost:3001/success?activeCode=${uid}`,
				type: "account_onboarding",
			})
			await Stripe.create({
				sellerId: id,
				stripeId: account.id,
				code: uid,
			})
			responseReturn(res, 201, { url: accountLink.url })
		} else {
			const account = await stripe.accounts.create({ type: "express" })

			const accountLink = await stripe.accountLinks.create({
				account: account.id,
				refresh_url: "http://localhost:3001/refresh",
				return_url: `http://localhost:3001/success?activeCode=${uid}`,
				type: "account_onboarding",
			})
			await Stripe.create({
				sellerId: id,
				stripeId: account.id,
				code: uid,
			})
			responseReturn(res, 201, { url: accountLink.url })
		}
	} catch (error) {
		console.log("stripe connect account error" + error.message)
	}
}

exports.activeStripeConnectAccount = async (req, res) => {
	const { activeCode } = req.params
	const { id, role } = req.auth

	try {
		const userStripeInfo = await Stripe.findOne({ code: activeCode })

		if (userStripeInfo) {
			await Seller.findByIdAndUpdate(id, {
				payment: "active",
			})
			responseReturn(res, 200, { message: "payment Active" })
		} else {
			responseReturn(res, 404, { message: "payment Active Fails" })
		}
	} catch (error) {
		responseReturn(res, 500, { message: "Internal Server Error" })
	}
}

const sumAmount = (data) => {
	let sum = 0
	for (let i = 0; i < data.length; i++) {
		sum = sum + data[i].amount
	}
	return sum
}

exports.fetchSellerPaymentDetails = async (req, res) => {
	const { sellerId } = req.params

	try {
		const payments = await SellerWallet.find({ sellerId })

		const pendingWithdraws = await WithdrawRequest.find({
			$and: [
				{
					sellerId: {
						$eq: sellerId,
					},
				},
				{
					status: {
						$eq: "pending",
					},
				},
			],
		})

		const successWithdraws = await WithdrawRequest.find({
			$and: [
				{
					sellerId: {
						$eq: sellerId,
					},
				},
				{
					status: {
						$eq: "success",
					},
				},
			],
		})

		const pendingAmount = sumAmount(pendingWithdraws)
		const withdrawAmount = sumAmount(successWithdraws)
		const totalAmount = sumAmount(payments)

		let availableAmount = 0

		if (totalAmount > 0) {
			availableAmount = totalAmount - (pendingAmount + withdrawAmount)
		}

		responseReturn(res, 200, {
			totalAmount,
			pendingAmount,
			withdrawAmount,
			availableAmount,
			pendingWithdraws,
			successWithdraws,
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.requestWithdrawal = async (req, res) => {
	const { amount, sellerId } = req.body

	try {
		const withdrawal = await WithdrawRequest.create({
			sellerId,
			amount: parseInt(amount),
		})
		responseReturn(res, 200, {
			withdrawal,
			message: "withdrawal Request Send",
		})
	} catch (error) {
		responseReturn(res, 500, { message: "Internal Server Error" })
	}
}

exports.fetchPaymentRequest = async (req, res) => {
	try {
		const withdrawalRequest = await WithdrawRequest.find({
			status: "pending",
		})
		responseReturn(res, 200, { withdrawalRequest })
	} catch (error) {
		responseReturn(res, 500, { message: "Internal Server Error" })
	}
}

exports.confirmPaymentRequest = async (req, res) => {
	const { paymentId } = req.body
	try {
		const payment = await WithdrawRequest.findById(paymentId)
		const { stripeId } = await Stripe.findOne({
			sellerId: new ObjectId(payment.sellerId),
		})

		await stripe.transfers.create({
			amount: payment.amount * 100,
			currency: "usd",
			destination: stripeId,
		})

		await WithdrawRequest.findByIdAndUpdate(paymentId, { status: "success" })
		responseReturn(res, 200, { payment, message: "Request Confirm Success" })
	} catch (error) {
		responseReturn(res, 500, { message: "Internal Server Error" })
	}
}
