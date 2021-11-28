const express = require("express");
const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const { engine } = require("express-handlebars");
const flash = require("connect-flash");
const path = require("path");
const app = express();

/*
* 클라이언트로부터 넘어오는 요청을
* 처리하기 위한 서버를 구축하기 위해
* 익스프레스 모듈의 기본 설정들을 하는 파일이다.
*
* 외부에서 require로 app 객체를 임포트하면 익스프레스 객체를 반환한다.
*/

// 익스프레스 모듈의 기본 설정들을 하는 함수
module.exports.config = function (test) {
  // 세션 설정
  const redisClient = redis.createClient();
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client: redisClient })
  }));

  // 익스프레스 설정
  app.use(express.json()); // express 4.16 버전부터는 body-parser가 내장되었음
  app.use(express.urlencoded({ extended: true })) // application/x-www-form-urlencoded 형태의 데이터 파싱 가능하게 설정
  app.use(express.static(path.join(process.env.INIT_CWD, "/public"))); // 정적 파일들 기본 폴더 설정

  // 템플릿 엔진 설정
  app.engine(".hbs", engine({
    extname: ".hbs",
    encoding: "utf-8",
    helpers: { // hbs 파일에서 #section 키워드로 style이나 script등을 파일마다 따로 적용할수 있게끔 함
      section: function(name, options) {
        if(!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
      }
    }
  }));
  app.set("view engine", ".hbs");
  app.set("views", "./src/views");

  // connect-flash 사용
  app.use(flash());
}

// 익스프레스 객체 반환
module.exports.app = app;