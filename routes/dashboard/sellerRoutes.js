const {
	updateSellerStatus,
	fetchSellers,
	fetchSeller,
	fetchActiveSellers,
	fetchInactiveSellers,
} = require("../../controllers/dashboard/sellerController")
const { requireSignIn } = require("../../middlewares/authMiddleware")
const router = require("express").Router()

router.get("/request/sellers", requireSignIn, fetchSellers)
router.get("/seller/:sellerId", requireSignIn, fetchSeller)
router.post("/seller/status/update", requireSignIn, updateSellerStatus)

router.get("/active/sellers", requireSignIn, fetchActiveSellers)

router.get("/inactive/sellers", requireSignIn, fetchInactiveSellers)

module.exports = router
