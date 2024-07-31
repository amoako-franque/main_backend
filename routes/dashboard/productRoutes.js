const {
	addProduct,
	fetchProduct,
	fetchProducts,
	productUpdate,
	productImageUpdate,
} = require("../../controllers/dashboard/productController")
const { requireSignIn } = require("../../middlewares/authMiddleware")

const router = require("express").Router()

router.post("/product", requireSignIn, addProduct)
router.get("/products", requireSignIn, fetchProducts)
router.get("/product/:productId", requireSignIn, fetchProduct)
router.put("/product/update", requireSignIn, productUpdate)
router.put("/product/image/update", requireSignIn, productImageUpdate)

module.exports = router
