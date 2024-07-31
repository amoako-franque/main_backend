const Customer = require("../../models/customerModel")
const { responseReturn } = require("../../utils/response")
const bcrypt = require("bcrypt")
const SellerCustomer = require("../../models/chat/sellerCustomerModel")
const createToken = require("../../utils/generateToken")

exports.customerRegister = async (req, res) => {
	const { name, email, password } = req.body

	try {
		const customer = await Customer.findOne({ email })
		if (customer) {
			responseReturn(res, 404, { error: "Email Already Exits" })
		} else {
			const createCustomer = await Customer.create({
				name: name.trim(),
				email: email.trim(),
				password: await bcrypt.hash(password, 10),
				method: "manually",
			})
			await SellerCustomer.create({
				myId: createCustomer.id,
			})
			const token = await createToken({
				id: createCustomer.id,
				name: createCustomer.name,
				email: createCustomer.email,
				method: createCustomer.method,
			})
			res.cookie("customerToken", token, {
				expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			})
			responseReturn(res, 201, { message: "User Register Success", token })
		}
	} catch (error) {
		console.log(error.message)
	}
}

exports.customerLogin = async (req, res) => {
	const { email, password } = req.body
	try {
		const customer = await Customer.findOne({ email }).select("+password")
		if (customer) {
			const match = await bcrypt.compare(password, customer.password)
			if (match) {
				const token = createToken({
					id: customer.id,
					name: customer.name,
					email: customer.email,
					method: customer.method,
				})
				res.cookie("customerToken", token, {
					expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				})
				responseReturn(res, 201, { message: "User Login Success", token })
			} else {
				responseReturn(res, 404, { error: "Password Wrong" })
			}
		} else {
			responseReturn(res, 404, { error: "Email Not Found" })
		}
	} catch (error) {
		console.log(error.message)
	}
}

exports.customerLogout = async (req, res) => {
	res.cookie("customerToken", "", {
		expires: new Date(Date.now()),
	})
	responseReturn(res, 200, { message: "Logout Success" })
}
