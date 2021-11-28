const indexController = require("../controllers/IndexController");
const testController = require("../controllers/TestController");
const nongsaroController = require("../controllers/NongsaroController");
const authController = require("../controllers/AuthController");

// 컨트롤러 라우팅 설정. URL 경로랑 컨트롤러 파일을 매칭시켜준다.
module.exports = function (app) {
  app.use("/", indexController);
  app.use("/test", testController); // 테스트용 컨트롤러. 기능 구현하기 전에 실험해보고 싶은게 있으면 여기에 미리 해보려고 넣었음.
  app.use("/auth", authController);
  app.use("/api/nongsaro", nongsaroController);
};