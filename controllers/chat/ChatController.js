const Seller = require("../../models/sellerModel")
const Customer = require("../../models/customerModel")
const sellerCustomer = require("../../models/chat/sellerCustomerModel")
const SellerCustomerMessage = require("../../models/chat/sellerCustomerMessageModel")
const AdminSellerMessage = require("../../models/chat/adminSellerMessageModel")
const { responseReturn } = require("../../utils/response")

exports.addCustomerFriend = async (req, res) => {
	const { sellerId, userId } = req.body

	try {
		if (sellerId !== "") {
			const seller = await Seller.findById(sellerId)
			const user = await Customer.findById(userId)
			const checkSeller = await sellerCustomerModel.findOne({
				$and: [
					{
						myId: {
							$eq: userId,
						},
					},
					{
						myFriends: {
							$elemMatch: {
								fdId: sellerId,
							},
						},
					},
				],
			})
			if (!checkSeller) {
				await sellerCustomerModel.updateOne(
					{
						myId: userId,
					},
					{
						$push: {
							myFriends: {
								fdId: sellerId,
								name: seller.shopInfo?.shopName,
								image: seller.image,
							},
						},
					}
				)
			}

			const checkCustomer = await sellerCustomerModel.findOne({
				$and: [
					{
						myId: {
							$eq: sellerId,
						},
					},
					{
						myFriends: {
							$elemMatch: {
								fdId: userId,
							},
						},
					},
				],
			})
			if (!checkCustomer) {
				await sellerCustomerModel.updateOne(
					{
						myId: sellerId,
					},
					{
						$push: {
							myFriends: {
								fdId: userId,
								name: user.name,
								image: "",
							},
						},
					}
				)
			}
			const messages = await SellerCustomerMessage.find({
				$or: [
					{
						$and: [
							{
								receiverId: { $eq: sellerId },
							},
							{
								senderId: {
									$eq: userId,
								},
							},
						],
					},
					{
						$and: [
							{
								receiverId: { $eq: userId },
							},
							{
								senderId: {
									$eq: sellerId,
								},
							},
						],
					},
				],
			})
			const MyFriends = await sellerCustomerModel.findOne({
				myId: userId,
			})
			const currentFd = MyFriends.myFriends.find((s) => s.fdId === sellerId)
			responseReturn(res, 200, {
				MyFriends: MyFriends.myFriends,
				currentFd,
				messages,
			})
		} else {
			const MyFriends = await sellerCustomerModel.findOne({
				myId: userId,
			})
			responseReturn(res, 200, {
				MyFriends: MyFriends.myFriends,
			})
		}
	} catch (error) {
		console.log(error)
	}
}

exports.addCustomerMessage = async (req, res) => {
	const { userId, text, sellerId, name } = req.body

	try {
		const message = await SellerCustomerMessage.create({
			senderId: userId,
			senderName: name,
			receiverId: sellerId,
			message: text,
		})

		const data = await sellerCustomerModel.findOne({ myId: userId })
		let myFriends = data.myFriends
		let index = myFriends.findIndex((f) => f.fdId === sellerId)
		while (index > 0) {
			let temp = myFriends[index]
			myFriends[index] = myFriends[index - 1]
			myFriends[index - 1] = temp
			index--
		}
		await sellerCustomerModel.updateOne(
			{
				myId: userId,
			},
			{
				myFriends,
			}
		)

		const data1 = await sellerCustomerModel.findOne({ myId: sellerId })
		let myFriends1 = data1.myFriends
		let index1 = myFriends1.findIndex((f) => f.fdId === userId)
		while (index1 > 0) {
			let temp1 = myFriends1[index1]
			myFriends1[index1] = myFriends[index1 - 1]
			myFriends1[index1 - 1] = temp1
			index1--
		}
		await sellerCustomerModel.updateOne(
			{
				myId: sellerId,
			},
			{
				myFriends1,
			}
		)

		responseReturn(res, 201, { message })
	} catch (error) {
		console.log(error)
	}
}

exports.fetchCustomersBySeller = async (req, res) => {
	const { sellerId } = req.params
	try {
		const data = await sellerCustomerModel.findOne({ myId: sellerId })
		responseReturn(res, 200, {
			customers: data.myFriends,
		})
	} catch (error) {
		console.log(error)
	}
}

exports.fetchCustomerMessageBySeller = async (req, res) => {
	const { customerId } = req.params
	const { id } = req.auth

	try {
		const messages = await SellerCustomerMessage.find({
			$or: [
				{
					$and: [
						{
							receiverId: { $eq: customerId },
						},
						{
							senderId: {
								$eq: id,
							},
						},
					],
				},
				{
					$and: [
						{
							receiverId: { $eq: id },
						},
						{
							senderId: {
								$eq: customerId,
							},
						},
					],
				},
			],
		})

		const currentCustomer = await Customer.findById(customerId)
		responseReturn(res, 200, {
			messages,
			currentCustomer,
		})
	} catch (error) {
		console.log(error)
	}
}

exports.sendMessageToCustomer = async (req, res) => {
	const { senderId, receiverId, text, name } = req.body
	try {
		const message = await SellerCustomerMessage.create({
			senderId: senderId,
			senderName: name,
			receiverId: receiverId,
			message: text,
		})

		const data = await sellerCustomerModel.findOne({ myId: senderId })
		let myFriends = data.myFriends
		let index = myFriends.findIndex((f) => f.fdId === receiverId)
		while (index > 0) {
			let temp = myFriends[index]
			myFriends[index] = myFriends[index - 1]
			myFriends[index - 1] = temp
			index--
		}
		await sellerCustomerModel.updateOne(
			{
				myId: senderId,
			},
			{
				myFriends,
			}
		)

		const data1 = await sellerCustomerModel.findOne({ myId: receiverId })
		let myFriends1 = data1.myFriends
		let index1 = myFriends1.findIndex((f) => f.fdId === senderId)
		while (index1 > 0) {
			let temp1 = myFriends1[index1]
			myFriends1[index1] = myFriends[index1 - 1]
			myFriends1[index1 - 1] = temp1
			index1--
		}
		await sellerCustomerModel.updateOne(
			{
				myId: receiverId,
			},
			{
				myFriends1,
			}
		)

		responseReturn(res, 201, { message })
	} catch (error) {
		console.log(error)
	}
}

exports.fetchSellersByAdmin = async (req, res) => {
	try {
		const sellers = await Seller.find({})
		responseReturn(res, 200, {
			sellers,
		})
	} catch (error) {
		console.log(error)
	}
}

exports.sellerAdminMessageInsert = async (req, res) => {
	const { senderId, receiverId, message, senderName } = req.body

	try {
		const messageData = await AdminSellerMessage.create({
			senderId,
			receiverId,
			message,
			senderName,
		})
		responseReturn(res, 200, { message: messageData })
	} catch (error) {
		console.log(error)
	}
}

exports.fetchAdminMessages = async (req, res) => {
	const { receiverId } = req.params
	const id = ""

	try {
		const messages = await AdminSellerMessage.find({
			$or: [
				{
					$and: [
						{
							receiverId: { $eq: receiverId },
						},
						{
							senderId: {
								$eq: id,
							},
						},
					],
				},
				{
					$and: [
						{
							receiverId: { $eq: id },
						},
						{
							senderId: {
								$eq: receiverId,
							},
						},
					],
				},
			],
		})

		let currentSeller = {}
		if (receiverId) {
			currentSeller = await Seller.findById(receiverId)
		}
		responseReturn(res, 200, {
			messages,
			currentSeller,
		})
	} catch (error) {
		console.log(error)
	}
}

exports.fetchSellerMessages = async (req, res) => {
	const receiverId = ""
	const { id } = req

	try {
		const messages = await AdminSellerMessage.find({
			$or: [
				{
					$and: [
						{
							receiverId: { $eq: receiverId },
						},
						{
							senderId: {
								$eq: id,
							},
						},
					],
				},
				{
					$and: [
						{
							receiverId: { $eq: id },
						},
						{
							senderId: {
								$eq: receiverId,
							},
						},
					],
				},
			],
		})

		responseReturn(res, 200, {
			messages,
		})
	} catch (error) {
		console.log(error)
	}
}
