const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")
const helmet = require("helmet")
const cookieParser = require("cookie-parser")
const db_connect = require("./config/db")
require("dotenv").config()

// db connect
db_connect()

const port = process.env.PORT || 8080

app.use(morgan("dev"))
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const socket = require("socket.io")
const http = require("http")

const server = http.createServer(app)
app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:3001"],
		credentials: true,
	})
)

const io = socket(server, {
	cors: {
		origin: "*",
		credentials: true,
	},
})

let all_customers = []
let all_sellers = []
let admin = {}

const addUser = (customerId, socketId, userInfo) => {
	const check_user = all_customers.some((u) => u.customerId === customerId)
	if (!check_user) {
		all_customers.push({
			customerId,
			socketId,
			userInfo,
		})
	}
}

const addSeller = (sellerId, socketId, userInfo) => {
	const check_seller = all_sellers.some((u) => u.sellerId === sellerId)
	if (!check_seller) {
		all_sellers.push({
			sellerId,
			socketId,
			userInfo,
		})
	}
}

const findCustomer = (customerId) => {
	return all_customers.find((c) => c.customerId === customerId)
}
const findSeller = (sellerId) => {
	return all_sellers.find((c) => c.sellerId === sellerId)
}

const remove = (socketId) => {
	all_customers = all_customers.filter((c) => c.socketId !== socketId)
	all_sellers = all_sellers.filter((c) => c.socketId !== socketId)
}

// io.on("connection", (soc) => {
// 	console.log("socket server running..")

// 	soc.on("add_user", (customerId, userInfo) => {
// 		addUser(customerId, soc.id, userInfo)
// 		io.emit("activeSeller", all_sellers)
// 	})
// 	soc.on("add_seller", (sellerId, userInfo) => {
// 		addSeller(sellerId, soc.id, userInfo)
// 		io.emit("activeSeller", all_sellers)
// 	})
// 	soc.on("send_seller_message", (msg) => {
// 		const customer = findCustomer(msg.receiverId)
// 		if (customer !== undefined) {
// 			soc.to(customer.socketId).emit("seller_message", msg)
// 		}
// 	})
// 	soc.on("send_customer_message", (msg) => {
// 		const seller = findSeller(msg.receiverId)
// 		if (seller !== undefined) {
// 			soc.to(seller.socketId).emit("customer_message", msg)
// 		}
// 	})

// 	soc.on("send_message_admin_to_seller", (msg) => {
// 		const seller = findSeller(msg.receiverId)
// 		if (seller !== undefined) {
// 			soc.to(seller.socketId).emit("received_admin_message", msg)
// 		}
// 	})

// 	soc.on("send_message_seller_to_admin", (msg) => {
// 		if (admin.socketId) {
// 			soc.to(admin.socketId).emit("received_seller_message", msg)
// 		}
// 	})

// 	soc.on("add_admin", (adminInfo) => {
// 		console.log(adminInfo)
// 		delete adminInfo.email
// 		delete adminInfo.password
// 		admin = adminInfo
// 		admin.socketId = soc.id
// 		io.emit("activeSeller", all_sellers)
// 	})

// 	soc.on("disconnect", () => {
// 		console.log("user disconnect")
// 		remove(soc.id)
// 		io.emit("activeSeller", all_sellers)
// 	})
// })

app.use("/api/home", require("./routes/home/homeRoutes"))
app.use("/api/v1", require("./routes/authRoutes"))
app.use("/api/v1", require("./routes/order/orderRoutes"))
app.use("/api/v1", require("./routes/home/cartRoutes"))
app.use("/api/v1", require("./routes/dashboard/categoryRoutes"))
app.use("/api/v1", require("./routes/dashboard/productRoutes"))
app.use("/api/v1", require("./routes/dashboard/sellerRoutes"))
app.use("/api/v1", require("./routes/home/customerAuthRoutes"))
app.use("/api/v1", require("./routes/chatRoutes"))
app.use("/api/v1", require("./routes/paymentRoutes"))

app.use("/api/v1", require("./routes/dashboard/dashboardRoutes"))

app.get("/", (req, res) => res.send("Hello Server"))

server.listen(port, () =>
	console.log(`>>> Server is running on port http://localhost:${port}`)
)
