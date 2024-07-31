const jwt = require("jsonwebtoken")
const TOKEN_SECRET = process.env.TOKEN_SECRET

const createToken = (data) => {
	const token = jwt.sign(data, TOKEN_SECRET, {
		expiresIn: "1d",
	})

	return token
}

module.exports = createToken
