const indexController = require("../controllers/IndexController");
const authController = require("../controllers/AuthController");
const adminController = require("../controllers/AdminController");
const apiController = require("../controllers/ApiController");

// 컨트롤러 라우팅 설정. URL 경로랑 컨트롤러 파일을 매칭시켜준다.
module.exports = function (app) {
  app.use("/", indexController);
  app.use("/admin", adminController);
  app.use("/auth", authController);
  app.use("/api", apiController);
};