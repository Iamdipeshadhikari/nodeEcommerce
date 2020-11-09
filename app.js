require("dotenv").config();
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const path = require("path");
const UserRoute = require("./route/user");
const ProductRoute = require("./route/product");
const CartRoute = require("./route/cart");
const mongoose = require("mongoose");
const session = require("express-session");
const MongodbSession = require("connect-mongodb-session")(session);


app.set("view engine", "ejs");
app.set("views", "views");

// Session Store
const store = new MongodbSession({
   uri: `mongodb+srv://projects:${process.env.DB_PASS}@my--projects--collection-ntta8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
   collection: "sessions",
});

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("upload/resized"));
app.use(
   session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: store,
   })
);
app.use((req, res, next) => {
   res.locals.IsLoggedIn = req.session.IsLoggedIn;
   res.locals.user = req.session.user;
   next();
});
app.use("/user", UserRoute);
app.use("/products", ProductRoute);
app.use("/cart", CartRoute);

mongoose
   .connect(
      `mongodb+srv://projects:${process.env.DB_PASS}@my--projects--collection-ntta8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
      {
         useNewUrlParser: true,
         useUnifiedTopology: true,
         useCreateIndex: true,
      }
   )
   .then(() => console.log("Database connection was successfull"))
   .catch(() => console.log("Database connection failed"));

// Render 404
app.use("*", (req, res) => {
   res.render("404", {
      pageTitle: "Page Not Found",
   });
});

app.listen(process.env.PORT, () => console.log("App Started Successfully"));
