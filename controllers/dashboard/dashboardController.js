const { responseReturn } = require("../../utils/response")
const MyShopWallet = require("../../models/myShopWalletModel")
const Product = require("../../models/productModel")
const CustomerOrder = require("../../models/customerOrderModel")
const Seller = require("../../models/sellerModel")
const AdminSellerMessage = require("../../models/chat/adminSellerMessageModel")
const SellerWallet = require("../../models/sellerWalletModel")
const AuthOrder = require("../../models/authOrderModel")
const SellerCustomerMessage = require("../../models/chat/sellerCustomerMessageModel")
const Banner = require("../../models/bannerModel")
const {
	mongo: { ObjectId },
} = require("mongoose")
const cloudinary = require("../../utils/cloudinary")
const formidable = require("formidable")

exports.fetchAdminDashboardData = async (req, res) => {
	const { id, role } = req.auth

	try {
		const totalSale = await MyShopWallet.aggregate([
			{
				$group: {
					_id: null,
					totalAmount: { $sum: "$amount" },
				},
			},
		])
		const totalProduct = await Product.find({}).countDocuments()
		const totalOrder = await CustomerOrder.find({}).countDocuments()
		const totalSeller = await Seller.find({}).countDocuments()
		const messages = await AdminSellerMessage.find({}).limit(3)
		const recentOrders = await CustomerOrder.find({}).limit(5)
		responseReturn(res, 200, {
			totalProduct,
			totalOrder,
			totalSeller,
			messages,
			recentOrders,
			totalSale: totalSale.length > 0 ? totalSale[0].totalAmount : 0,
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.fetchSellerDashboardData = async (req, res) => {
	const { id, role } = req.auth

	try {
		const totalSale = await SellerWallet.aggregate([
			{
				$match: {
					sellerId: {
						$eq: id,
					},
				},
			},
			{
				$group: {
					_id: null,
					totalAmount: { $sum: "$amount" },
				},
			},
		])

		const totalProduct = await Product.find({
			sellerId: new ObjectId(id),
		}).countDocuments()

		const totalOrder = await AuthOrder.find({
			sellerId: new ObjectId(id),
		}).countDocuments()

		const totalPendingOrder = await AuthOrder.find({
			$and: [
				{
					sellerId: {
						$eq: new ObjectId(id),
					},
				},
				{
					delivery_status: {
						$eq: "pending",
					},
				},
			],
		}).countDocuments()
		const messages = await SellerCustomerMessage.find({
			$or: [
				{
					senderId: {
						$eq: id,
					},
				},
				{
					receiverId: {
						$eq: id,
					},
				},
			],
		}).limit(3)

		const recentOrders = await AuthOrder.find({
			sellerId: new ObjectId(id),
		}).limit(5)

		responseReturn(res, 200, {
			totalProduct,
			totalOrder,
			totalPendingOrder,
			messages,
			recentOrders,
			totalSale: totalSale.length > 0 ? totalSale[0].totalAmount : 0,
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.addBanner = async (req, res) => {
	const form = formidable({ multiples: true })
	form.parse(req, async (err, field, files) => {
		const { productId } = field
		const { main_banner } = files

		try {
			const { slug } = await Product.findById(productId)
			const result = await cloudinary.uploader.upload(main_banner.filepath, {
				folder: "banners",
			})
			const banner = await Banner.create({
				productId,
				banner: result.url,
				link: slug,
			})
			responseReturn(res, 200, { banner, message: "Banner Add Success" })
		} catch (error) {
			responseReturn(res, 500, { error: error.message })
		}
	})
}

exports.fetchBanner = async (req, res) => {
	const { productId } = req.params
	try {
		const banner = await Banner.findOne({
			productId: new ObjectId(productId),
		})
		responseReturn(res, 200, { banner })
	} catch (error) {
		responseReturn(res, 500, { error: error.message })
	}
}

exports.updateBanner = async (req, res) => {
	const { bannerId } = req.params
	const form = formidable({})

	form.parse(req, async (err, _, files) => {
		const { main_banner } = files

		try {
			let banner = await Banner.findById(bannerId)
			let temp = banner.banner.split("/")
			temp = temp[temp.length - 1]
			const imageName = temp.split(".")[0]
			await cloudinary.uploader.destroy(imageName)

			const result = await cloudinary.uploader.upload(main_banner.filepath, {
				folder: "banners",
			})

			await Banner.findByIdAndUpdate(bannerId, {
				banner: result.secure_url,
			})

			banner = await Banner.findById(bannerId)
			responseReturn(res, 200, { banner, message: "Banner Updated Success" })
		} catch (error) {
			responseReturn(res, 500, { error: error.message })
		}
	})
}

exports.fetchBanners = async (req, res) => {
	try {
		const banners = await Banner.aggregate([
			{
				$sample: {
					size: 5,
				},
			},
		])
		responseReturn(res, 200, { banners })
	} catch (error) {
		responseReturn(res, 500, { error: error.message })
	}
}
