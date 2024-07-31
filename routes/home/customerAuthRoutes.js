const {
	customerRegister,
	customerLogout,
	customerLogin,
} = require("../../controllers/home/customerAuthController")

const router = require("express").Router()

router.post("/customer/register", customerRegister)
router.post("/customer/login", customerLogin)
router.post("/customer/logout", customerLogout)

module.exports = router
