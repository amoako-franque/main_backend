const {
	addCategory,
	fetchCategory,
} = require("../../controllers/dashboard/categoryController")
const { requireSignIn } = require("../../middlewares/authMiddleware")

const router = require("express").Router()

router.post("/category", requireSignIn, addCategory)
router.get("/category", requireSignIn, fetchCategory)

module.exports = router
