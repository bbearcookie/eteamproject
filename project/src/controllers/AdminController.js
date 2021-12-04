const router = require("express").Router();
const nongsaroController = require("./admin/NongsaroController");
const dietController = require("./admin/DietController");
const foodController = require("./admin/FoodController");
const adminService = require("../services/AdminService");

// 관리자 접근 권한 확인
router.use("/", async (req, res, next) => {
  if (!adminService.isAdmin(req.user)) {
    res.status(403).json({error: "관리자가 아닙니다."});
    return;
  }
  next();
});

// 관리자 메인 페이지 보여줌
router.get("/", async (req, res) => {
  res.render("admin/main.ejs", {
    pageName: "main",
    sectionName: "main"
  });
});

// /admin 하위 기능들
router.use("/nongsaro", nongsaroController);
router.use("/diet", dietController);
router.use("/food", foodController);

module.exports = router;