const {
	addToCart,
	deleteCartItems,
	quantityInc,
	quantityDec,
	addToWishlist,
	getUserWishlist,
	getUserCartItems,
	removeWishlist,
} = require("../../controllers/home/cartController")

const router = require("express").Router()

router.post("/home/cart", addToCart)
router.get("/home/cart/products/:userId", getUserCartItems)
router.delete("/home/cart/:cartId", deleteCartItems)
router.put("/home/cart/inc/quantity/:cartId", quantityInc)
router.put("/home/cart/dec/quantity/:cartId", quantityDec)

router.post("/home/wishlist", addToWishlist)
router.get("/home/wishlists/:userId", getUserWishlist)
router.delete("/home/wishlist/:wishlistId", removeWishlist)

module.exports = router
