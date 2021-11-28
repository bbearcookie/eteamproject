const router = require("express").Router();

// 임시 메인 페이지 보여줌
router.get("/", async (req, res) => {
  console.log(req.user);

  res.render("pages/home", {
    isAuthenticated: req.isAuthenticated(),
    user: req.user
  });
});

module.exports = router;