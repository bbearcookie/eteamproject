const router = require("express").Router();
const User = require("../models/User");
const Allergy = require("../models/Allergy");

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
  let allergyList = await Allergy.find();
  let user = await User.findOne({username: req.user.username});

  res.render("user/allergy", {
    allergyList,
    user
  });
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
  let user = await User.findOne({username: req.user.username});
  user.allergy = Object.values(req.body);
  await user.save();

  res.redirect("/myPage");
});

module.exports = router;