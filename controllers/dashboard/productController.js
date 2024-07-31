const formidable = require("formidable")
const { responseReturn } = require("../../utils/response")
const cloudinary = require("../../utils/cloudinary")
const Product = require("../../models/productModel")

exports.addProduct = async (req, res) => {
	const { id, role } = req.auth

	const form = formidable({ multiples: true })

	form.parse(req, async (err, field, files) => {
		let {
			name,
			category,
			description,
			stock,
			price,
			discount,
			shopName,
			brand,
		} = field
		const { images } = files
		name = name.trim()
		const slug = name.split(" ").join("-")

		try {
			let allImageUrl = []
			for (let i = 0; i < images.length; i++) {
				const result = await cloudinary.uploader.upload(images[i].filepath, {
					folder: "products_images",
				})
				allImageUrl = [...allImageUrl, result.secure_url]
			}

			await Product.create({
				sellerId: id,
				name,
				slug,
				shopName,
				category: category.trim(),
				description: description.trim(),
				stock: parseInt(stock),
				price: parseInt(price),
				discount: parseInt(discount),
				images: allImageUrl,
				brand: brand.trim(),
			})
			responseReturn(res, 201, { message: "Product Added Successfully" })
		} catch (error) {
			responseReturn(res, 500, { error: error.message })
		}
	})
}

exports.fetchProducts = async (req, res) => {
	const { page, searchValue, perPage } = req.query
	const { id, role } = req.auth

	const skipPage = parseInt(perPage) * (parseInt(page) - 1)

	try {
		if (searchValue) {
			const products = await Product.find({
				$text: { $search: searchValue },
				sellerId: id,
			})
				.skip(skipPage)
				.limit(perPage)
				.sort({ createdAt: -1 })
			const totalProduct = await Product.find({
				$text: { $search: searchValue },
				sellerId: id,
			}).countDocuments()
			responseReturn(res, 200, { products, totalProduct })
		} else {
			const products = await Product.find({ sellerId: id })
				.skip(skipPage)
				.limit(perPage)
				.sort({ createdAt: -1 })
			const totalProduct = await Product.find({ sellerId: id }).countDocuments()
			responseReturn(res, 200, { products, totalProduct })
		}
	} catch (error) {
		console.log(error.message)
	}
}

exports.fetchProduct = async (req, res) => {
	const { productId } = req.params
	try {
		const product = await Product.findById(productId)
		responseReturn(res, 200, { product })
	} catch (error) {
		console.log(error.message)
	}
}

exports.productUpdate = async (req, res) => {
	let { name, description, stock, price, discount, brand, productId } = req.body
	name = name.trim()
	const slug = name.split(" ").join("-")

	try {
		await Product.findByIdAndUpdate(productId, {
			name,
			description,
			stock,
			price,
			discount,
			brand,
			productId,
			slug,
		})
		const product = await Product.findById(productId)
		responseReturn(res, 200, {
			product,
			message: "Product Updated Successfully",
		})
	} catch (error) {
		responseReturn(res, 500, { error: error.message })
	}
}

exports.productImageUpdate = async (req, res) => {
	const form = formidable({ multiples: true })

	form.parse(req, async (err, field, files) => {
		const { oldImage, productId } = field
		const { newImage } = files

		if (err) {
			responseReturn(res, 400, { error: err.message })
		} else {
			try {
				const result = await cloudinary.uploader.upload(newImage.filepath, {
					folder: "products_images",
				})

				if (result) {
					let { images } = await Product.findById(productId)
					const index = images.findIndex((img) => img === oldImage)
					images[index] = result.secure_url
					await Product.findByIdAndUpdate(productId, { images })

					const product = await Product.findById(productId)
					responseReturn(res, 200, {
						product,
						message: "Product Image Updated Successfully",
					})
				} else {
					responseReturn(res, 404, { error: "Image Upload Failed" })
				}
			} catch (error) {
				responseReturn(res, 404, { error: error.message })
			}
		}
	})
}
