module.exports = (req, res, next) => {
   if (!req.session.IsLoggedIn) {
      return res.redirect("/user/login");
   }

   next();
};
