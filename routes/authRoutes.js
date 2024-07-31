const {
	adminLogin,
	fetchUserProfile,
	registerSeller,
	profileAvatarUpload,
	updateProfile,
	logout,
	loginSeller,
	adminRegister,
} = require("../controllers/authControllers")
const { requireSignIn, isSuperAdmin } = require("../middlewares/authMiddleware")

const router = require("express").Router()

router.post("/admin/register", requireSignIn, isSuperAdmin, adminRegister)
router.post("/admin/login", adminLogin)
router.post("/seller/register", registerSeller)
router.post("/seller/login", loginSeller)
router.get("/user/profile", requireSignIn, fetchUserProfile)
router.put("/avatar/upload", requireSignIn, profileAvatarUpload)
router.put("/profile/update", requireSignIn, updateProfile)
router.post("/logout", requireSignIn, logout)

module.exports = router
