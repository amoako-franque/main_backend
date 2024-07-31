const Category = require("../../models/categoryModel")
const Product = require("../../models/productModel")
const Review = require("../../models/reviewModel")
const { responseReturn } = require("../../utils/response")
const queryProducts = require("../../utils/queryProducts")
const moment = require("moment")
const {
	mongo: { ObjectId },
} = require("mongoose")

const formateProduct = (products) => {
	const productArray = []
	let i = 0
	while (i < products.length) {
		let temp = []
		let j = i
		while (j < i + 3) {
			if (products[j]) {
				temp.push(products[j])
			}
			j++
		}
		productArray.push([...temp])
		i = j
	}
	return productArray
}

exports.getCategories = async (req, res) => {
	try {
		const categories = await Category.find({})
		responseReturn(res, 200, {
			categories,
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.getProducts = async (req, res) => {
	try {
		const products = await Product.find({}).limit(12).sort({
			createdAt: -1,
		})
		const allProduct1 = await Product.find({}).limit(9).sort({
			createdAt: -1,
		})
		const latest_product = formateProduct(allProduct1)

		const allProduct2 = await Product.find({}).limit(9).sort({
			rating: -1,
		})
		const topRated_product = formateProduct(allProduct2)

		const allProduct3 = await Product.find({}).limit(9).sort({
			discount: -1,
		})
		const discount_product = formateProduct(allProduct3)

		responseReturn(res, 200, {
			products,
			latest_product,
			topRated_product,
			discount_product,
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.priceRangeProduct = async (req, res) => {
	try {
		const priceRange = {
			low: 0,
			high: 0,
		}
		const products = await Product.find({}).limit(9).sort({
			createdAt: -1,
		})
		const latest_product = formateProduct(products)
		const getForPrice = await Product.find({}).sort({
			price: 1,
		})
		if (getForPrice.length > 0) {
			priceRange.high = getForPrice[getForPrice.length - 1].price
			priceRange.low = getForPrice[0].price
		}
		responseReturn(res, 200, {
			latest_product,
			priceRange,
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.queryProducts = async (req, res) => {
	const parPage = 12
	req.query.parPage = parPage

	try {
		const products = await Product.find({}).sort({
			createdAt: -1,
		})
		const totalProduct = new queryProducts(products, req.query)
			.categoryQuery()
			.ratingQuery()
			.searchQuery()
			.priceQuery()
			.sortByPrice()
			.countProducts()

		const result = new queryProducts(products, req.query)
			.categoryQuery()
			.ratingQuery()
			.priceQuery()
			.searchQuery()
			.sortByPrice()
			.skip()
			.limit()
			.getProducts()

		responseReturn(res, 200, {
			products: result,
			totalProduct,
			parPage,
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.getProduct = async (req, res) => {
	const { slug } = req.params
	try {
		const product = await Product.findOne({ slug })

		const relatedProducts = await Product.find({
			$and: [
				{
					_id: {
						$ne: product.id,
					},
				},
				{
					category: {
						$eq: product.category,
					},
				},
			],
		}).limit(12)
		const moreProducts = await Product.find({
			$and: [
				{
					_id: {
						$ne: product.id,
					},
				},
				{
					sellerId: {
						$eq: product.sellerId,
					},
				},
			],
		}).limit(3)
		responseReturn(res, 200, {
			product,
			relatedProducts,
			moreProducts,
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.reviewProduct = async (req, res) => {
	const { productId, rating, review, name } = req.body

	try {
		await Review.create({
			productId,
			name,
			rating,
			review,
			date: moment(Date.now()).format("LL"),
		})

		let rat = 0
		const reviews = await Review.find({
			productId,
		})
		for (let i = 0; i < reviews.length; i++) {
			rat = rat + reviews[i].rating
		}
		let productRating = 0
		if (reviews.length !== 0) {
			productRating = (rat / reviews.length).toFixed(1)
		}

		await Product.findByIdAndUpdate(productId, {
			rating: productRating,
		})
		responseReturn(res, 201, {
			message: "Review Added Successfully",
		})
	} catch (error) {
		console.log(error.message)
	}
}

exports.getProductReviews = async (req, res) => {
	const { productId } = req.params
	let { pageNo } = req.query
	pageNo = parseInt(pageNo)
	const limit = 5
	const skipPage = limit * (pageNo - 1)

	try {
		let getRating = await Review.aggregate([
			{
				$match: {
					productId: {
						$eq: new ObjectId(productId),
					},
					rating: {
						$not: {
							$size: 0,
						},
					},
				},
			},
			{
				$unwind: "$rating",
			},
			{
				$group: {
					_id: "$rating",
					count: {
						$sum: 1,
					},
				},
			},
		])
		let rating_review = [
			{
				rating: 5,
				sum: 0,
			},
			{
				rating: 4,
				sum: 0,
			},
			{
				rating: 3,
				sum: 0,
			},
			{
				rating: 2,
				sum: 0,
			},
			{
				rating: 1,
				sum: 0,
			},
		]
		for (let i = 0; i < rating_review.length; i++) {
			for (let j = 0; j < getRating.length; j++) {
				if (rating_review[i].rating === getRating[j]._id) {
					rating_review[i].sum = getRating[j].count
					break
				}
			}
		}

		const getAll = await Review.find({
			productId,
		})
		const reviews = await Review.find({
			productId,
		})
			.skip(skipPage)
			.limit(limit)
			.sort({ createdAt: -1 })

		responseReturn(res, 200, {
			reviews,
			totalReview: getAll.length,
			rating_review,
		})
	} catch (error) {
		console.log(error.message)
	}
}
