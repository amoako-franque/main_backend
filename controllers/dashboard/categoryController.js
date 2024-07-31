const formidable = require("formidable")
const { responseReturn } = require("../../utils/response")
const cloudinary = require("../../utils/cloudinary")
const Category = require("../../models/categoryModel")

exports.addCategory = async (req, res) => {
	const form = formidable()
	form.parse(req, async (err, fields, files) => {
		if (err) {
			responseReturn(res, 404, { error: "something went wrong" })
		} else {
			let { name } = fields
			let { image } = files
			name = name.trim()
			const slug = name.split(" ").join("-")

			try {
				const result = await cloudinary.uploader.upload(image.filepath, {
					folder: "categories_images",
				})

				if (result) {
					const category = await Category.create({
						name,
						slug,
						image: result.secure_url,
					})
					responseReturn(res, 201, {
						category,
						message: "Category Added Successfully",
					})
				} else {
					responseReturn(res, 404, { error: "Image Upload File" })
				}
			} catch (error) {
				responseReturn(res, 500, { error: "Internal Server Error" })
			}
		}
	})
}

exports.fetchCategory = async (req, res) => {
	const { page, searchValue, perPage } = req.query

	try {
		let skipPage = ""
		if (perPage && page) {
			skipPage = parseInt(perPage) * (parseInt(page) - 1)
		}

		if (searchValue && page && perPage) {
			const categories = await Category.find({
				$text: { $search: searchValue },
			})
				.skip(skipPage)
				.limit(perPage)
				.sort({ createdAt: -1 })
			const totalCategory = await Category.find({
				$text: { $search: searchValue },
			}).countDocuments()
			responseReturn(res, 200, { categories, totalCategory })
		} else if (searchValue === "" && page && perPage) {
			const categories = await Category.find({})
				.skip(skipPage)
				.limit(perPage)
				.sort({ createdAt: -1 })
			const totalCategory = await Category.find({}).countDocuments()
			responseReturn(res, 200, { categories, totalCategory })
		} else {
			const categories = await Category.find({}).sort({ createdAt: -1 })
			const totalCategory = await Category.find({}).countDocuments()
			responseReturn(res, 200, { categories, totalCategory })
		}
	} catch (error) {
		console.log(error.message)
	}
}

exports.fetchCategories = async (req, res) => {
	const categories = await Category.find().exec()

	res.status(200).json({ categories })
}
