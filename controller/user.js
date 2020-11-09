const { validationResult } = require("express-validator");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.getSignupPage = (req, res) => {
  res.render("signup", {
    pageTitle: "Signup Account",
    message: null,
  });
};

exports.getLoginPage = (req, res) => {
  res.render("login", {
    pageTitle: "Login Account",
    message: null,
  });
};

exports.getForgetPassword = (req, res) => {
  res.render("forgetPassword", {
    pageTitle: "Forget Account",
    message: null,
  });
};

exports.getNewPassword = (req, res) => {
  const token = req.params.resetToken;

  res.render("newPassword", {
    pageTitle: "New Password",
    message: null,
    token,
  });
};

// Funtionality
exports.PostSignup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.render("signup", {
      pageTitle: "Signup Account",
      message: "All Fields are mandatory",
    });
  }

  if (name.length < 5) {
    return res.render("signup", {
      pageTitle: "Signup Account",
      message: "Name Lenth should be greater than or equal to 5",
    });
  }

  if (password.length < 7) {
    return res.render("signup", {
      pageTitle: "Signup Account",
      message: "Password should be greater or equal to 8",
    });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("signup", {
      pageTitle: "Signup Account",
      message: errors.errors[0].msg,
    });
  }

  try {
    const ExistingUser = await User.findOne({ email });

    if (ExistingUser) {
      return res.render("signup", {
        pageTitle: "Signup Account",
        message: "Email address is already in use. Go To Login Page",
      });
    }

    const hashedPW = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      password: hashedPW,
    });

    await newUser.save();

    res.render("signup", {
      pageTitle: "Signup Account",
      message: "Account Created Successfully. Go To Login Page",
    });
  } catch (e) {
    console.log(e);
    res.render("signup", {
      pageTitle: "Signup Account",
      message: "Server Error Occured Please Try later",
    });
  }
};

exports.PostLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("login", {
      pageTitle: "Login Account",
      message: "All Fields are mandatory",
    });
  }

  try {
    const ExistingUser = await User.findOne({ email });

    if (!ExistingUser) {
      return res.render("login", {
        pageTitle: "Login Account",
        message: "No user with that email address",
      });
    }

    const isMatch = await bcrypt.compare(password, ExistingUser.password);

    if (!isMatch) {
      return res.render("login", {
        pageTitle: "Login Account",
        message: "Check your password",
      });
    }

    req.session.IsLoggedIn = true;
    req.session.user = ExistingUser;

    res.redirect("/products");
  } catch (e) {
    console.log(e);
    res.render("login", {
      pageTitle: "Login Account",
      message: "Server Error Occured Please Try later",
    });
  }
};

exports.PostLoggedOut = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.PostForgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.render("forgetPassword", {
      pageTitle: "Forget Password",
      message: "Please provide email",
    });
  }

  try {
    const ExistingUser = await User.findOne({ email });

    if (!ExistingUser) {
      return res.render("forgetPassword", {
        pageTitle: "Forget Password",
        message: "There is no account with this email",
      });
    }

    const ResetToken = JWT.sign(
      { id: ExistingUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    ExistingUser.resetToken = ResetToken;
    ExistingUser.resetTokenExpiration = Date.now() + 3600000;

    await ExistingUser.save();

    // Sending Email
    // 1)
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "techymanjil96@gmail.com",
        pass: "FuckedUP123",
      },
    });
    // 2)
    const mailOptions = {
      from: "techymanjil96@gmail.com",
      to: email,
      subject: "Password Forget (Node-commerce)",
      text: `Follow this link to successfully recover your password. <strong>http://localhost:4000/user/newPassword/${ResetToken}</strong>`,
    };
    // 3)
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.render("forgetPassword", {
      pageTitle: "Forget Password",
      message: "Reset password link send to your account. Please Check",
    });
  } catch (e) {
    console.log(e);
    res.render("forgetPassword", {
      pageTitle: "Forget Password",
      message: "Server Error Occured Please Try later",
    });
  }
};

exports.PostNewPassword = async (req, res) => {
  const { password, passwordConfirm } = req.body;
  const token = req.params.resetToken;

  if (!password || !passwordConfirm) {
    return res.render("newPassword", {
      pageTitle: "New Password",
      message: "All Fields are mandatory",
      token,
    });
  }

  if (password.length < 7) {
    return res.render("newPassword", {
      pageTitle: "New Password",
      message: "Password should be minimum of 7 characters",
      token,
    });
  }

  if (password !== passwordConfirm) {
    return res.render("newPassword", {
      pageTitle: "New Password",
      message: "Passwords do not matched",
      token,
    });
  }

  try {
    const isTokenValid = await User.findOne({
      resetToken: `${token}`,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!isTokenValid) {
      return res.render("newPassword", {
        pageTitle: "New Password",
        message: "Sorry Your Token is expired",
        token: null,
      });
    }

    const EncryptNewPassword = await bcrypt.hash(password, 12);

    isTokenValid.password = EncryptNewPassword;

    await isTokenValid.save();

    res.render("newPassword", {
      pageTitle: "New Password",
      message: "Password Changed Successfully",
      token: null,
    });
  } catch (e) {
    console.log(e);
    res.render("newPassword", {
      pageTitle: "New Password",
      message: "Server Error Occured Please Try later",
    });
  }
};
