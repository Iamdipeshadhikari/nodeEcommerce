const Product = require("../model/product");
const User = require("../model/user");

exports.GetCartPage = async (req, res) => {
   try {
      const user = await User.findById(req.session.user._id).populate(
         "cart.items.productId"
      );

      const products = user.cart.items;

      let total = 0;

      for (let i = 0; i < products.length; i++) {
         total += products[i].productId.price * products[i].quantity;
      }

      res.render("cart", {
         pageTitle: "Cart Page",
         message: null,
         products,
         total,
      });
   } catch (e) {
      console.log(e);
      res.render("cart", {
         pageTitle: "Cart Page",
         message: "Server Error Occured Please try again",
         products: null,
      });
   }
};

exports.PostCartItem = async (req, res) => {
   try {
      const { productId } = req.body;

      const product = await Product.findById(productId);

      const user = await User.findById(req.session.user._id);

      if (!product || !user) {
         res.redirect("/products");
      }

      user.AddToCart(product);

      res.redirect("cart");
   } catch (e) {
      console.log(e);
      res.render("cart", {
         pageTitle: "Cart Page",
         message: "Server Error Occured Please try again",
      });
   }
};

exports.PostCartItemRemove = async (req, res) => {
   try {
      const { productId } = req.body;

      const product = await Product.findById(productId);

      const user = await User.findById(req.session.user._id);

      if (!product || !user) {
         res.redirect("/products");
      }

      user.RemoveFromCart(productId);

      res.redirect("/cart");
   } catch (e) {
      console.log(e);
      res.render("cart", {
         pageTitle: "Cart Page",
         message: "Server Error Occured Please try again",
      });
   }
};

exports.PostCartAddOne = async (req, res) => {
   try {
      const { productId } = req.body;

      const product = await Product.findById(productId);

      const user = await User.findById(req.session.user._id);

      if (!product || !user) {
         return res.redirect("/cart");
      }

      user.AddToCart(product);

      res.redirect("/cart");
   } catch (e) {
      console.log(e);
      res.render("cart", {
         pageTitle: "Cart Page",
         message: "Server Error Occured Please try again",
      });
   }
};

exports.PostCartRemoveOne = async (req, res) => {
   try {
      const { productId } = req.body;

      const product = await Product.findById(productId);

      const user = await User.findById(req.session.user._id);

      if (!product || !user) {
         return res.redirect("/cart");
      }

      user.RemoveSingleCartItem(product);

      res.redirect("/cart");
   } catch (e) {
      console.log(e);
      res.render("cart", {
         pageTitle: "Cart Page",
         message: "Server Error Occured Please try again",
      });
   }
};

exports.CheckOutFunctionality = async (req, res) => {
   try {
      const user = await User.findById(req.session.user._id);

      user.ClearCart();

      res.render('cart', {
         pageTitle: 'Cart Page',
         message: 'Your order has been processed',
         products: null,
         total: null
      })
   } catch (e) {
      console.log(e);
      res.render("cart", {
         pageTitle: "Cart Page",
         message: "Server Error Occured Please try again",
      });
   }
};
