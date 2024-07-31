const mongoose = require("mongoose")
const { Schema } = mongoose

const adminSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
		select: false,
	},
	image: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ["admin", "super_admin"],
		default: "admin",
	},
})

const Admin = mongoose.model("admins", adminSchema)
module.exports = Admin
