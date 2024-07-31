const {
	createStripeConnectAccount,
	activeStripeConnectAccount,
	requestWithdrawal,
	fetchSellerPaymentDetails,
	fetchPaymentRequest,
	confirmPaymentRequest,
} = require("../controllers/payment/paymentController")
const { requireSignIn, isSuperAdmin } = require("../middlewares/authMiddleware")
const router = require("express").Router()

router.get(
	"/payment/create-stripe-connect-account",
	requireSignIn,
	createStripeConnectAccount
)

router.put(
	"/payment/active-stripe-connect-account/:activeCode",
	requireSignIn,
	activeStripeConnectAccount
)

router.get(
	"/payment/seller/payment/details/:sellerId",
	requireSignIn,
	fetchSellerPaymentDetails
)
router.post("/payment/withdrawal/request", requireSignIn, requestWithdrawal)
router.get("/payment/request", requireSignIn, fetchPaymentRequest)
router.post("/confirm/payment/request", requireSignIn, confirmPaymentRequest)

module.exports = router
