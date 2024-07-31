const mongoose = require("mongoose")

const db_connect = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URL)

		console.log("Database connected successfully... ")
	} catch (error) {
		console.log("Error connecting to database... ", error)
	}
}

module.exports = db_connect
