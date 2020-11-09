const express = require("express");
const router = express.Router();
const CartController = require("../controller/cart");
const isAuth = require("../middleware/is-auth");

router.get("/", isAuth, CartController.GetCartPage);
router.post("/checkout", isAuth, CartController.CheckOutFunctionality)

// Functionality
router.post("/", isAuth, CartController.PostCartItem);
router.post("/remove", isAuth, CartController.PostCartItemRemove)
router.post("/addOne", isAuth, CartController.PostCartAddOne)
router.post("/removeOne", isAuth, CartController.PostCartRemoveOne)


module.exports = router;
