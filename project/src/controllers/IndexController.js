const router = require("express").Router();

// 임시 메인 페이지 보여줌
router.get("/", async (req, res) => {
  
  // 관리자 계정으로 접속시 관리자 페이지로 이동
  if (req.user) {
    if (req.user.role === "role_admin") {
      res.redirect("/admin");
      return;
    }
  }

  res.render("pages/home.hbs", {
    isAuthenticated: req.isAuthenticated(),
    user: req.user
  });
});

module.exports = router;