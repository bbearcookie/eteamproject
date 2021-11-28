// 세션 암호화 키, 농사로 API 키, DB 이름 등을 환경변수로 따로 저장하여 사용하기 위해 dotenv 모듈을 사용한다.
require("dotenv").config();

// 몽고 DB 연결
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL);

// 익스프레스 설정 (세션 정보는 redis에 저장됨)
const app = require("./src/config/express").app;
require("./src/config/express").config();

// 패스포트 설정 (반드시 익스프레스의 세션 설정 이후에 와야함)
require("./src/config/passport").config(app);

// 라우팅 설정
require("./src/config/routes")(app);

// 서버 실행
app.listen(3000, () => {
  console.log("3000 포트 실행");
});