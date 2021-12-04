const router = require("express").Router();
const apiController = require("./admin/ApiController");
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

// /admin 하위 기능들
router.use("/api", apiController);
router.use("/diet", dietController);
router.use("/food", foodController);

// 관리자 메인 페이지 보여줌
router.get("/", async (req, res) => {
  res.render("admin/main.ejs", {
    pageName: "main",
    sectionName: "main"
  });
});

// 농사로 데이터 페이지 보여줌
router.get("/nongsaro", async (req, res) => {
  res.render("admin/main.ejs", {
    pageName: "nongsaro",
    sectionName: "nongsaro"
  });
});

module.exports = router;