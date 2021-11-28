const router = require("express").Router();
const User = require("../models/User");
const { passport } = require("../config/passport");

// 로그인 페이지 보여줌
router.get("/login", async (req, res) => {
  res.render("pages/auth/login", { alert: req.flash() });
});

// 회원가입 페이지 보여줌
router.get("/signup", async (req, res) => {
  res.render("pages/auth/signup", { alert: req.flash() });
});

// 로그인 처리
router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/auth/login",
  failureFlash: true
}));

// 회원가입 처리
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  let user = new User({username: username, password: password});

  if (await User.find({username: username})) {
    req.flash("error", "이미 존재하는 아이디입니다.");
  }

  await user.save((err) => {
    if (!err) {
      req.flash();
      res.redirect("/auth/login");
    } else {
      res.redirect("/auth/signup");
    }
  });
});

// 로그아웃 처리
router.get("/logout", async (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    res.redirect("/auth/login");
  });
});

module.exports = router;