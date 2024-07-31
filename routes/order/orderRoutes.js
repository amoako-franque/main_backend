const router = require("express").Router()
const {
	placeOrder,
	createPayment,
	confirmOrder,
	adminOrderStatusUpdate,
	fetchCustomerDashboardData,
	fetchCustomerOrders,
	fetchOrderDetails,
	fetchAdminOrders,
	fetchAdminOrder,
	fetchSellerOrders,
	fetchSellerOrder,
	sellerOrderStatusUpdate,
} = require("../../controllers/order/orderController")

// customer
router.post("/order/place-order", placeOrder)
router.get("/customer/dashboard/:userId", fetchCustomerDashboardData)
router.get("/customer/orders/:customerId/:status", fetchCustomerOrders)
router.get("/customer/order/details/:orderId", fetchOrderDetails)
router.post("/order/create-payment", createPayment)
router.get("/order/confirm/:orderId", confirmOrder)

// Admin
router.get("/admin/orders", fetchAdminOrders)
router.get("/admin/order/:orderId", fetchAdminOrder)
router.put("/admin/order/status/update/:orderId", adminOrderStatusUpdate)

// Seller
router.get("/seller/orders/:sellerId", fetchSellerOrders)
router.get("/seller/order/:orderId", fetchSellerOrder)
router.put("/seller/order/status/update/:orderId", sellerOrderStatusUpdate)

module.exports = router
