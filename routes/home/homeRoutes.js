const {
	getCategories,
	getProducts,
	priceRangeProduct,
	queryProducts,
	productDetails,
	getProduct,
	getProductReviews,
	reviewProduct,
} = require("../../controllers/home/homeControllers")

const router = require("express").Router()

router.get("/categories", getCategories)
router.get("/products", getProducts)
router.get("/price-range-latest-product", priceRangeProduct)
router.get("/products/query", queryProducts)
router.get("/product/:slug", getProduct)

router.post("/customer/review", reviewProduct)
router.get("/customer/reviews/:productId", getProductReviews)

module.exports = router
