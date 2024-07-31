const jwt = require("jsonwebtoken")
const TOKEN_SECRET = process.env.TOKEN_SECRET

exports.requireSignIn = async (req, res, next) => {
	const token = req.cookies.accessToken

	if (!token) {
		res.status(409).json({ error: "Please Login to continue" })
		return false
	} else {
		try {
			const data = await jwt.verify(token, TOKEN_SECRET)
			req.auth = data
			next()
		} catch (error) {
			res.status(409).json({ error: "Please Login" })
			return false
		}
	}
}

exports.isAdmin = async (req, res, next) => {
	const { role } = req?.auth

	if (role !== "Admin" || role !== "Super Admin") {
		return res.status(401).json({
			error: "You are not an admin. Contact your administrator",
		})
	} else {
		next()
	}
}

exports.isSuperAdmin = async (req, res, next) => {
	const { role } = req?.auth

	if (role !== "Super Admin") {
		return res.status(401).json({
			error: "You are not an admin. Contact your administrator",
		})
	} else {
		next()
	}
}
