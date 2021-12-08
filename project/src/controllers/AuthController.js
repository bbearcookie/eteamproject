const router = require("express").Router();
const User = require("../models/User");
const { passport } = require("../config/passport");

// 로그인 페이지 보여줌
router.get("/login", async (req, res) => {
  let successMessage = undefined;

  // 이미 로그인 되어있으면 메인 페이지로 이동
  if (req.user) {
    return res.redirect("/");
  }

  // 회원가입 성공후 리다이렉션 된거면 성공 메시지 출력
  if (req.session.successMessage) {
    successMessage = req.session.successMessage;
    req.session.successMessage = null;
  }


  res.render("auth/login", {
    alert: req.flash(),
    successMessage
  });
});

// 회원가입 페이지 보여줌
router.get("/signup", async (req, res) => {

  // 이미 로그인 되어있으면 메인 페이지로 이동
  if (req.user) {
    return res.redirect("/");
  }
  
  res.render("auth/signup", { alert: req.flash() });
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
      req.session.successMessage = "회원가입 성공!";
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