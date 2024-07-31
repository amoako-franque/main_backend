const {
	addCustomerFriend,
	addCustomerMessage,
	sellerAdminMessageInsert,
	fetchAdminMessages,
	fetchSellerMessages,
	fetchSellersByAdmin,
	fetchCustomersBySeller,
	fetchCustomerMessageBySeller,
	sendMessageToCustomer,
} = require("../controllers/chat/ChatController")
const { requireSignIn, isSuperAdmin } = require("../middlewares/authMiddleware")
const router = require("express").Router()

router.post("/chat/customer/add-customer-friend", addCustomerFriend)
router.post("/chat/customer/send/message/to/seller", addCustomerMessage)
router.get("/chat/seller/customers/:sellerId", fetchCustomersBySeller)
router.get(
	"/chat/seller/customer/messages/:customerId",
	requireSignIn,
	fetchCustomerMessageBySeller
)
router.post(
	"/chat/seller/send/message/customer",
	requireSignIn,
	sendMessageToCustomer
)

router.get("/chat/admin/sellers", requireSignIn, fetchSellersByAdmin)
router.post(
	"/chat/admin/send/seller/message",
	requireSignIn,
	sellerAdminMessageInsert
)
router.get(
	"/chat/admin/messages/:receiverId",
	requireSignIn,
	fetchAdminMessages
)
router.get("/chat/seller/messages", requireSignIn, fetchSellerMessages)

module.exports = router
