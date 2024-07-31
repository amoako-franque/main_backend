const formidable = require("formidable")
const { responseReturn } = require("../../utils/response")
const cloudinary = require("../../utils/cloudinary")
const Seller = require("../../models/sellerModel")

exports.fetchSellers = async (req, res) => {
	const { page, searchValue, perPage } = req.query
	const skipPage = parseInt(perPage) * (parseInt(page) - 1)

	try {
		if (searchValue) {
		} else {
			const sellers = await Seller.find({ status: "pending" })
				.skip(skipPage)
				.limit(perPage)
				.sort({ createdAt: -1 })
			const totalSeller = await Seller.find({
				status: "pending",
			}).countDocuments()
			responseReturn(res, 200, { sellers, totalSeller })
		}
	} catch (error) {
		responseReturn(res, 500, { error: error.message })
	}
}

exports.fetchSeller = async (req, res) => {
	const { sellerId } = req.params
	try {
		const seller = await Seller.findById(sellerId)
		responseReturn(res, 200, { seller })
	} catch (error) {
		responseReturn(res, 500, { error: error.message })
	}
}

exports.updateSellerStatus = async (req, res) => {
	const { sellerId, status } = req.body
	try {
		await Seller.findByIdAndUpdate(sellerId, { status })
		const seller = await Seller.findById(sellerId)
		responseReturn(res, 200, {
			seller,
			message: "Seller Status Updated Successfully",
		})
	} catch (error) {
		responseReturn(res, 500, { error: error.message })
	}
}

exports.fetchActiveSellers = async (req, res) => {
	let { page, searchValue, perPage } = req.query
	page = parseInt(page)
	perPage = parseInt(perPage)

	const skipPage = perPage * (page - 1)

	try {
		if (searchValue) {
			const sellers = await Seller.find({
				$text: { $search: searchValue },
				status: "active",
			})
				.skip(skipPage)
				.limit(perPage)
				.sort({ createdAt: -1 })

			const totalSeller = await Seller.find({
				$text: { $search: searchValue },
				status: "active",
			}).countDocuments()
			responseReturn(res, 200, { totalSeller, sellers })
		} else {
			const sellers = await Seller.find({ status: "active" })
				.skip(skipPage)
				.limit(perPage)
				.sort({ createdAt: -1 })

			const totalSeller = await Seller.find({
				status: "active",
			}).countDocuments()
			responseReturn(res, 200, { totalSeller, sellers })
		}
	} catch (error) {
		console.log("active seller get " + error.message)
	}
}

exports.fetchInactiveSellers = async (req, res) => {
	let { page, searchValue, perPage } = req.query
	page = parseInt(page)
	perPage = parseInt(perPage)

	const skipPage = perPage * (page - 1)

	try {
		if (searchValue) {
			const sellers = await Seller.find({
				$text: { $search: searchValue },
				status: "inactive",
			})
				.skip(skipPage)
				.limit(perPage)
				.sort({ createdAt: -1 })

			const totalSeller = await Seller.find({
				$text: { $search: searchValue },
				status: "inactive",
			}).countDocuments()
			responseReturn(res, 200, { totalSeller, sellers })
		} else {
			const sellers = await Seller.find({ status: "inactive" })
				.skip(skipPage)
				.limit(perPage)
				.sort({ createdAt: -1 })

			const totalSeller = await Seller.find({
				status: "inactive",
			}).countDocuments()
			responseReturn(res, 200, { totalSeller, sellers })
		}
	} catch (error) {
		console.log("inactive seller get " + error.message)
	}
}
