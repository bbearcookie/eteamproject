const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

/*
* 회원가입, 로그인 등의 사용자 인증을 구현하기 위해
* 패스포트 모듈을 적용하였는데,
* 그 모듈에 필요한 설정들을 하는 파일이다.
*
* 외부에서 require로 passport 객체를 임포트하면 패스포트 객체를 반환한다.
*/

// 사용자 인증을 위한 패스포트 모듈의 기본 설정들을 하는 함수
module.exports.config = function (app) {
  // 익스프레스에 패스포트 등록 (반드시 익스프레스의 세션 설정 이후에 와야함)
  app.use(passport.initialize());
  app.use(passport.session());

  // 처음 로그인에 성공하면 로그인이 성공한 정보를 세션에 저장하는 역할을 함.
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // 한번 로그인 한 이후에 페이지를 리로드 할 때마다 실행됨. 세션에 저장된 정보를 이용해서 사용자의 필요한 정보를 추출할 수 있음.
  passport.deserializeUser((id, done) => {

    // 뷰단에 user 객체를 보낸후 뷰단에서 user의 하위 프로퍼티들을 추출해서 쓸 수 있게 하려면 lean을 해줘야 함.
    User.findById(id).lean().exec((err, user) => {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy({
    usernameField: "username",
    passwordField: "password"
  }, (username, password, done) => {
    User.findOne({username: username}, (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: "아이디가 존재하지 않습니다." });
      }
      if (!user.isValidPassword(password)) {
        return done(null, false, { message: "비밀번호가 틀렸습니다." });
      }
      return done(null, user);
    });
  }));
}

// 패스포트 객체 반환
module.exports.passport = passport;