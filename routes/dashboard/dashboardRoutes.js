const {
	updateBanner,
	addBanner,
	fetchSellerDashboardData,
	fetchAdminDashboardData,
	fetchBanner,
	fetchBanners,
} = require("../../controllers/dashboard/dashboardController")
const { requireSignIn } = require("../../middlewares/authMiddleware")

const router = require("express").Router()

router.post("/banner", requireSignIn, addBanner)
router.get("/admin/dashboard/data", requireSignIn, fetchAdminDashboardData)
router.get("/seller/dashboard/data", requireSignIn, fetchSellerDashboardData)
router.get("/banners", fetchBanners)
router.get("/banner/:productId", requireSignIn, fetchBanner)
router.put("/banner/update/:bannerId", requireSignIn, updateBanner)

module.exports = router
