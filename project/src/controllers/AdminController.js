const router = require("express").Router();
const nongsaroController = require("./admin/NongsaroController");
const dietController = require("./admin/diet/DietController");
const foodController = require("./admin/food/FoodController");

// 관리자 접근 권한 확인
router.use("/", async (req, res, next) => {
  if (!req.user || req.user.role !== "role_admin") {
    res.status(403).json({error: "관리자가 아닙니다."});
    return;
  }

  next();
});

// 관리자 메인 페이지 보여줌
router.get("/", async (req, res) => {
  res.render("admin/main.ejs", {
    pageName: "mainContent",
    sectionName: "main"
  });
});

// /admin 하위 기능들
router.use("/nongsaro", nongsaroController);
router.use("/diet", dietController);
router.use("/food", foodController);

module.exports = router;