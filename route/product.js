const express = require("express");
const router = express.Router();
const ProductController = require("../controller/product");
const multer = require("multer");
const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");

const upload = multer({
   dest: "upload/",
});

router.get("/", isAuth, ProductController.getProducts);
router.get("/create", isAdmin, ProductController.getCreateProduct);
router.get("/update/:ProductId", isAdmin, ProductController.getUpdateProduct);
router.get("/manage", isAdmin, ProductController.getProductManage);
router.get("/:ProductId", isAuth, ProductController.getSingleProduct);

// Functional
router.post(
   "/create",
   isAdmin,
   upload.single("image"),
   ProductController.PostProductCreate
);
router.post(
   "/update",
   isAdmin,
   upload.single("image"),
   ProductController.PostProductUpdate
);
router.post("/delete", isAdmin, ProductController.PostDeleteProduct);

module.exports = router;
