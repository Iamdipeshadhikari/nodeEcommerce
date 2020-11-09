const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
   name: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      required: true,
      unique: true,
   },
   password: {
      type: String,
      required: true,
   },
   role: {
      type: String,
      default: "user",
   },
   resetToken: String,
   resetTokenExpiration: Date,
   cart: {
      items: [
         {
            productId: {
               type: Schema.Types.ObjectId,
               ref: "Product",
               required: true,
            },
            quantity: {
               type: Number,
               required: true,
            },
         },
      ],
   },
});

// Method
UserSchema.methods.AddToCart = function (product) {
   const cartProductIndex = this.cart.items.findIndex(
      (p) => p.productId.toString() === product._id.toString()
   );

   let newQuantity = 1;
   const updatedCartItems = [...this.cart.items];

   if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
   } else {
      updatedCartItems.push({
         productId: product._id,
         quantity: newQuantity,
      });
   }

   const updateCart = {
      items: updatedCartItems,
   };

   this.cart = updateCart;

   return this.save();
};

UserSchema.methods.RemoveFromCart = function (productId) {
   const updatedCartItems = this.cart.items.filter(
      (p) => p.productId.toString() !== productId.toString()
   );

   this.cart.items = updatedCartItems;

   return this.save();
};

UserSchema.methods.RemoveSingleCartItem = function (product) {
   const cartProductIndex = this.cart.items.findIndex(
      (p) => p.productId.toString() === product._id.toString()
   );

   let newQuantity;
   const updatedCartItems = [...this.cart.items];

   if (cartProductIndex >= 0) {
      if (this.cart.items[cartProductIndex].quantity > 1) {
         newQuantity = this.cart.items[cartProductIndex].quantity - 1;
         updatedCartItems[cartProductIndex].quantity = newQuantity;
      }
   }

   const updateCart = {
      items: updatedCartItems,
   };

   this.cart = updateCart;

   return this.save();
};

UserSchema.methods.ClearCart = function() {
   this.cart = { items: [] };
   return this.save();
};


module.exports = mongoose.model("User", UserSchema);
