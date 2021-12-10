const router = require("express").Router();
const User = require("../models/User");

//================================= << get >> =================================
// 메인 페이지 (식단추천 or 운동추천 선택 페이지)
router.get("/", async (req, res) => {

  // 관리자 계정으로 접속시 관리자 페이지로 이동
  if (req.user) {
    if (req.user.role === "role_admin") {
      return res.redirect("/admin");
    }
  // 접속이 안되있으면 로그인 페이지로 이동 
  } else {
    return res.redirect("/auth/login");
  }

  res.render("user/main");
});

// 마이 페이지
router.get("/myPage", async (req, res) => {
  let user = await User.findOne({username: req.user.username});

  res.render("user/myPage", {
    user
  });
});

// 알레르기 정보 페이지
router.get("/allergy", async (req, res) => {
  res.render("user/allergy");
});

router.get("/recomDiet",async(req,res)=>{
  res.render("user/recomDiet");
}); //get 식단추천페이지!

router.get("/recomWork",async(req,res)=>{
  res.render("user/recomWork");
}); //get 운동추천페이지

// get 마이페이지
router.get("/myPage",async(req,res)=>{
  res.render("user/myPage");
});


// 마이 페이지 작성 처리
router.post("/myPage", async (req, res) => {
  const { name, age, gender } = req.body;
  
  let user = await User.findOne({username: req.user.username});
  user.name = name;
  user.age = parseInt(age);
  user.gender = gender;
  await user.save();

  res.redirect("/myPage");
});

// 알레르기 유발 정보 작성 처리
router.post("/allergy", async (req, res) => {
  console.log(req.body);

  res.redirect("/myPage");
});

// =================== << 회원가입 디비에 등록하는 코드 >> ===================
// // 스키마 모델에서 일부를 따와서 등록하는 형태이다!!!!!!!!!!
// router.post("/myPage", async (req, res) => {
//   try {
//     const {userAge, userGender} = req.body; // 저
//     let user = await User.findOne({username: req.user.username}); // 현재 로그인된 사용자의 정보는 req.user로 가져올 수 있다.

//     // age, gender 필드 값 적용
//     user.age = userAge;
//     user.gender = userGender;

//     // DB에 저장
//     await user.save();
//     return res.send(user); //스키마를 collection에서 출력해준다!!!!!!

//   } catch(error){
//     console.log("catch 에러 받았음");
//     console.log(error);
//   }
// });

module.exports = router;