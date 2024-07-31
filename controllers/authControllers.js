const Admin = require("../models/adminModel")
const Seller = require("../models/sellerModel")
const SellerCustomer = require("../models/chat/sellerCustomerModel")
const { responseReturn } = require("../utils/response")
const bcrypt = require("bcrypt")
const cloudinary = require("../utils/cloudinary")
const formidable = require("formidable")
const createToken = require("../utils/generateToken")

exports.adminRegister = async (req, res) => {
	const { role, id } = req?.auth

	if (role !== "super_admin") {
		res.status(403).json({
			error:
				" You don't have permission to perform this action. Contact Admin ",
		})
		return
	}
	const { name, email, password, user_role } = req.body

	let accepted_roles = ["admin", "super_admin"]

	if (!accepted_roles.includes(user_role)) {
		return res.status(400).json({ error: "Please select a valid role" })
	}

	const adminExists = await Admin.findOne({ email }).exec()

	if (adminExists) {
		res.status(400).json({
			message: "Admin already exists",
		})
		return false
	}

	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(password, salt)
	try {
		await Admin.create({
			name,
			password: hashedPassword,
			email,
			image:
				"https://res.cloudinary.com/danmxcgez/image/upload/v1712782538/profile_pics/bqkzfixzbqmuiz5jwmgs.jpg",
		})
		res.status(200).json({
			success: true,
			message: "Admin registered successfully...",
		})
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error.message,
		})
	}
}
exports.adminLogin = async (req, res) => {
	const { email, password } = req.body
	try {
		const admin = await Admin.findOne({ email }).select("+password")
		// console.log(admin)
		if (admin) {
			const match = await bcrypt.compare(password, admin.password)
			// console.log(match)
			if (match) {
				const token = await createToken({
					id: admin.id,
					role: admin.role,
				})
				res.cookie("accessToken", token, {
					expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				})
				responseReturn(res, 200, { token, message: "Login Success" })
			} else {
				responseReturn(res, 404, { error: "Password Wrong" })
			}
		} else {
			responseReturn(res, 404, { error: "Email not Found" })
		}
	} catch (error) {
		responseReturn(res, 500, { error: error.message })
	}
}

exports.loginSeller = async (req, res) => {
	const { email, password } = req.body
	try {
		const seller = await Seller.findOne({ email }).select("+password")
		// console.log(admin)
		if (seller) {
			const match = await bcrypt.compare(password, seller.password)
			// console.log(match)
			if (match) {
				const token = await createToken({
					id: seller.id,
					role: seller.role,
				})
				res.cookie("accessToken", token, {
					expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				})
				responseReturn(res, 200, { token, message: "Login Success" })
			} else {
				responseReturn(res, 404, { error: "Password Wrong" })
			}
		} else {
			responseReturn(res, 404, { error: "Email not Found" })
		}
	} catch (error) {
		responseReturn(res, 500, { error: error.message })
	}
}

exports.registerSeller = async (req, res) => {
	const { email, name, password } = req.body
	try {
		const getUser = await Seller.findOne({ email })
		if (getUser) {
			responseReturn(res, 404, { error: "Email Already Exit" })
		} else {
			const seller = await Seller.create({
				name,
				email,
				password: await bcrypt.hash(password, 10),
				method: "manually",
				shopInfo: {},
			})
			await SellerCustomer.create({
				myId: seller.id,
			})

			const token = await createToken({ id: seller.id, role: seller.role })
			res.cookie("accessToken", token, {
				expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			})

			responseReturn(res, 201, { token, message: "Register Success" })
		}
	} catch (error) {
		responseReturn(res, 500, { error: "Internal Server Error" })
	}
}

exports.fetchUserProfile = async (req, res) => {
	const { id, role } = req.auth

	try {
		if (role === "admin") {
			const user = await Admin.findById(id)
			responseReturn(res, 200, { userInfo: user })
		} else {
			const seller = await Seller.findById(id)
			responseReturn(res, 200, { userInfo: seller })
		}
	} catch (error) {
		responseReturn(res, 500, { error: "Internal Server Error" })
	}
}

exports.profileAvatarUpload = async (req, res) => {
	const { id } = req.auth

	const form = formidable({ multiples: true })
	form.parse(req, async (err, _, files) => {
		const { image } = files

		try {
			const result = await cloudinary.uploader.upload(image.filepath, {
				folder: "local-store-profile-avatars",
			})
			if (result) {
				await Seller.findByIdAndUpdate(id, {
					image: result.url,
				})
				const userInfo = await Seller.findById(id)
				responseReturn(res, 201, {
					message: "Profile Image Upload Successfully",
					userInfo,
				})
			} else {
				responseReturn(res, 404, { error: "Image Upload Failed" })
			}
		} catch (error) {
			responseReturn(res, 500, { error: error.message })
		}
	})
}

exports.updateProfile = async (req, res) => {
	const { division, district, shopName, sub_district } = req.body
	const { id } = req.auth

	try {
		await Seller.findByIdAndUpdate(id, {
			shopInfo: {
				shopName,
				division,
				district,
				sub_district,
			},
		})
		const userInfo = await Seller.findById(id)
		responseReturn(res, 201, {
			message: "Profile info Add Successfully",
			userInfo,
		})
	} catch (error) {
		responseReturn(res, 500, { error: error.message })
	}
}

exports.logout = async (req, res) => {
	try {
		res.cookie("accessToken", null, {
			expires: new Date(Date.now()),
			httpOnly: true,
		})
		responseReturn(res, 200, { message: "logout Success" })
	} catch (error) {
		responseReturn(res, 500, { error: error.message })
	}
}
