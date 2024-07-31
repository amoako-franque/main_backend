const AuthOrder = require("../../models/authOrderModel")
const CustomerOrder = require("../../models/customerOrderModel")
const MyShopWallet = require("../../models/myShopWalletModel")
const SellerWallet = require("../../models/sellerWalletModel")
const Card = require("../../models/cartModel")
const moment = require("moment")
const { responseReturn } = require("../../utils/response")
const {
	mongo: { ObjectId },
} = require("mongoose")
const stripe = require("stripe")(process.env.STRIPE_KEY)

const check_if_paid = async (id) => {
	try {
		const order = await CustomerOrder.findById(id)
		if (order.payment_status === "unpaid") {
			await CustomerOrder.findByIdAndUpdate(id, {
				delivery_status: "cancelled",
			})
			await AuthOrder.updateMany(
				{
					orderId: id,
				},
				{
					delivery_status: "cancelled",
				}
			)
		}
		return true
	} catch (error) {
		console.log(error)
	}
}

exports.placeOrder = async (req, res) => {
	const { price, products, shipping_fee, shippingInfo, userId } = req.body
	let authorOrderData = []
	let cardId = []
	const tempDate = moment(Date.now()).format("LLL")

	let customerOrderProduct = []

	for (let i = 0; i < products.length; i++) {
		const pro = products[i].products
		for (let j = 0; j < pro.length; j++) {
			const tempCusPro = pro[j].productInfo
			tempCusPro.quantity = pro[j].quantity
			customerOrderProduct.push(tempCusPro)
			if (pro[j]._id) {
				cardId.push(pro[j]._id)
			}
		}
	}

	try {
		const order = await CustomerOrder.create({
			customerId: userId,
			shippingInfo,
			products: customerOrderProduct,
			price: price + shipping_fee,
			payment_status: "unpaid",
			delivery_status: "pending",
			date: tempDate,
		})
		for (let i = 0; i < products.length; i++) {
			const pro = products[i].products
			const pri = products[i].price
			const sellerId = products[i].sellerId
			let storePor = []
			for (let j = 0; j < pro.length; j++) {
				const tempPro = pro[j].productInfo
				tempPro.quantity = pro[j].quantity
				storePor.push(tempPro)
			}

			authorOrderData.push({
				orderId: order.id,
				sellerId,
				products: storePor,
				price: pri,
				payment_status: "unpaid",
				shippingInfo: "Easy Main Warehouse",
				delivery_status: "pending",
				date: tempDate,
			})
		}

		await AuthOrder.insertMany(authorOrderData)
		for (let k = 0; k < cardId.length; k++) {
			await Card.findByIdAndDelete(cardId[k])
		}

		setTimeout(() => {
			check_if_paid(order.id)
		}, 15000)

		responseReturn(res, 200, {
			message: "Order Placed Success",
			orderId: order.id,
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.fetchCustomerDashboardData = async (req, res) => {
	const { userId } = req.params

	try {
		const recentOrders = await CustomerOrder.find({
			customerId: new ObjectId(userId),
		}).limit(5)
		const pendingOrder = await CustomerOrder.find({
			customerId: new ObjectId(userId),
			delivery_status: "pending",
		}).countDocuments()
		const totalOrder = await CustomerOrder.find({
			customerId: new ObjectId(userId),
		}).countDocuments()
		const cancelledOrder = await CustomerOrder.find({
			customerId: new ObjectId(userId),
			delivery_status: "cancelled",
		}).countDocuments()
		responseReturn(res, 200, {
			recentOrders,
			pendingOrder,
			totalOrder,
			cancelledOrder,
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.fetchCustomerOrders = async (req, res) => {
	const { customerId, status } = req.params

	try {
		let orders = []
		if (status !== "all") {
			orders = await CustomerOrder.find({
				customerId: new ObjectId(customerId),
				delivery_status: status,
			})
		} else {
			orders = await CustomerOrder.find({
				customerId: new ObjectId(customerId),
			})
		}
		responseReturn(res, 200, {
			orders,
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.fetchOrderDetails = async (req, res) => {
	const { orderId } = req.params

	try {
		const order = await CustomerOrder.findById(orderId)
		responseReturn(res, 200, {
			order,
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.createPayment = async (req, res) => {
	const { price } = req.body
	try {
		const payment = await stripe.paymentIntents.create({
			amount: price * 100,
			currency: "usd",
			automatic_payment_methods: {
				enabled: true,
			},
		})
		responseReturn(res, 200, { clientSecret: payment.client_secret })
	} catch (error) {
		console.log(error.message)
	}
}

exports.confirmOrder = async (req, res) => {
	const { orderId } = req.params
	try {
		await CustomerOrder.findByIdAndUpdate(orderId, { payment_status: "paid" })
		await AuthOrder.updateMany(
			{ orderId: new ObjectId(orderId) },
			{
				payment_status: "paid",
				delivery_status: "pending",
			}
		)
		const customer_order = await CustomerOrder.findById(orderId)

		const auth_order = await AuthOrder.find({
			orderId: new ObjectId(orderId),
		})

		const time = moment(Date.now()).format("l")
		const splitTime = time.split("/")

		await MyShopWallet.create({
			amount: customer_order.price,
			month: splitTime[0],
			year: splitTime[2],
		})

		for (let i = 0; i < auth_order.length; i++) {
			await SellerWallet.create({
				sellerId: auth_order[i].sellerId.toString(),
				amount: auth_order[i].price,
				month: splitTime[0],
				year: splitTime[2],
			})
		}
		responseReturn(res, 200, { message: "success" })
	} catch (error) {
		console.log(error.message)
	}
}

// seller functions
exports.fetchSellerOrders = async (req, res) => {
	const { sellerId } = req.params
	let { page, searchValue, perPage } = req.query
	page = parseInt(page)
	perPage = parseInt(perPage)

	const skipPage = perPage * (page - 1)

	try {
		if (searchValue) {
		} else {
			const orders = await AuthOrder.find({
				sellerId,
			})
				.skip(skipPage)
				.limit(perPage)
				.sort({ createdAt: -1 })
			const totalOrder = await AuthOrder.find({
				sellerId,
			}).countDocuments()
			responseReturn(res, 200, { orders, totalOrder })
		}
	} catch (error) {
		console.log("fetching seller Orders error" + error.message)
		responseReturn(res, 500, { message: "internal server error" })
	}
}

exports.fetchSellerOrder = async (req, res) => {
	const { orderId } = req.params

	try {
		const order = await AuthOrder.findById(orderId)
		responseReturn(res, 200, { order })
	} catch (error) {
		console.log("fetching seller order details error" + error.message)
	}
}

exports.sellerOrderStatusUpdate = async (req, res) => {
	const { orderId } = req.params
	const { status } = req.body

	try {
		await AuthOrder.findByIdAndUpdate(orderId, {
			delivery_status: status,
		})
		responseReturn(res, 200, { message: "order status updated successfully" })
	} catch (error) {
		console.log("get seller Order error" + error.message)
		responseReturn(res, 500, { message: "internal server error" })
	}
}

// admin functions

exports.fetchAdminOrders = async (req, res) => {
	let { page, searchValue, perPage } = req.query
	page = parseInt(page)
	perPage = parseInt(perPage)

	const skipPage = perPage * (page - 1)

	try {
		if (searchValue) {
		} else {
			const orders = await CustomerOrder.aggregate([
				{
					$lookup: {
						from: "author_orders",
						localField: "_id",
						foreignField: "orderId",
						as: "suborder",
					},
				},
			])
				.skip(skipPage)
				.limit(perPage)
				.sort({ createdAt: -1 })

			const totalOrder = await CustomerOrder.aggregate([
				{
					$lookup: {
						from: "author_orders",
						localField: "_id",
						foreignField: "orderId",
						as: "suborder",
					},
				},
			])

			responseReturn(res, 200, { orders, totalOrder: totalOrder.length })
		}
	} catch (error) {
		console.log(error.message)
	}
}

exports.fetchAdminOrder = async (req, res) => {
	const { orderId } = req.params
	try {
		const order = await CustomerOrder.aggregate([
			{
				$match: { _id: new ObjectId(orderId) },
			},
			{
				$lookup: {
					from: "author_orders",
					localField: "_id",
					foreignField: "orderId",
					as: "suborder",
				},
			},
		])
		responseReturn(res, 200, { order: order[0] })
	} catch (error) {
		console.log("get admin order details" + error.message)
	}
}

exports.adminOrderStatusUpdate = async (req, res) => {
	const { orderId } = req.params
	const { status } = req.body

	try {
		await CustomerOrder.findByIdAndUpdate(orderId, {
			delivery_status: status,
		})
		responseReturn(res, 200, { message: "order Status change success" })
	} catch (error) {
		console.log("get admin status error" + error.message)
		responseReturn(res, 500, { message: "internal server error" })
	}
}
