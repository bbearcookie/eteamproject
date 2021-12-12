const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Diet = require("../models/Diet");
const Food = require("../models/Food");
const Allergy = require("../models/Allergy");
const indexService = require("../services/IndexService");

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

// 추천 식단 페이지
// 모든 음식들을 가져오고
// 알레르기 성분이 들어간 음식은 제외한다.
// 그 후에 음식이 포함된 모든 식단을 가져온다.
// 그러면 그 식단중 랜덤해서 3개를 보내준다.
router.get("/recommendDiet", async (req, res) => {
  let user = await User.findOne({username: req.user.username});

  // 사용자의 알레르기 성분 가져옴.
  let allergyFilter = [];
  for (allergy of user.allergy) {
    allergyFilter.push(mongoose.Types.ObjectId(allergy));
  }
  let allergyList = await Allergy.find({_id: { $in: allergyFilter }});

  let allergyStrings = [];
  for (allergy of allergyList) {
    for (str of allergy.strings) {
      allergyStrings.push(str);
    }
  }

  // 알레르기 성분이 재료로 포함되지 않은 음식만 추출하여 가져오기 위해 정규식을 작성할것이다.
  let regexString = "";
  for (str of allergyStrings) {

    // 처음으로 입력되는거 아니면 앞에 | 를 붙혀줌.
    if (regexString !== "") {
      regexString += "|";
    }

    regexString += str;
  }

  // ?! 부분이 부정문 부분임. 저 부분 지우면 알레르기 성분이 포함된 음식만 추출.
  regexString = `^(?!.*(${regexString})).*$`;
  let regex = new RegExp(regexString);
  let foodList = await Food.find({"matrlInfo": { $regex: regex } });
  let cntntsNoList = [];

  // 알레르기 성분이 없는 음식이 포함된 식단을 가져옴.
  for (food of foodList) {
    
    // 아직 cntntsNoList에 해당 식단이 들어가지 않은 경우 추가한다.
    // 여러개의 음식이 같은 식단을 가리킬수 있는데 식단이 중복으로 들어가는걸 방지하기 위함.
    if (!cntntsNoList.includes(food.cntntsNo)) {
      cntntsNoList.push(food.cntntsNo);
    }
  }
  // cntntsNoList에 식단코드가 기록되어있는 식단들만 정보를 가져옴.
  let dietList = await Diet.find({ cntntsNo: { $in: cntntsNoList }});

  // 랜덤해서 3개의 식단만 화면으로 보내줌.
  let resultDietList = [];
  while (resultDietList.length < 3) {
    
    // 랜덤으로 뽑는 과정에 중복된 식단은 보여주면 안됨.
    let diet = dietList[indexService.getRandomInt(0, dietList.length)];
    if (!resultDietList.includes(diet)) {
      resultDietList.push(diet);
    }
  }

  res.render("user/recommendDiet", {
    dietList: resultDietList
  });
});

router.get("/recomWork",async(req,res)=>{
  res.render("user/recomWork");
}); //get 운동추천페이지, 운동챗봇으로 연결

// 마이 페이지 작성 처리
router.post("/myPage", async (req, res) => {
  const { name, age, gender } = req.body;
  
  let user = await User.findOne({username: req.user.username});
  user.name = name;
  user.age = parseInt(age);
  user.gender = gender;
  await user.save();

  res.redirect("/recommendDiet");
});

// 알레르기 유발 정보 작성 처리
router.post("/allergy", async (req, res) => {
  let user = await User.findOne({username: req.user.username});
  user.allergy = Object.values(req.body);
  await user.save();

  res.redirect("/myPage");
});

// 식단 추천 페이지에서 내 식단에 추가 처리
router.post("/recommendDiet/:cntntsNo", async (req, res) => {
  let { cntntsNo } = req.params;

  // 사용자의 내 식단 목록에 아직 해당 식단이 들어있지 않다면 추가해줌.
  let diet = await Diet.findOne({cntntsNo});
  let user = await User.findOne({username: req.user.username});
  if (!user.myDiet.includes(cntntsNo)) {
    user.myDiet.push(cntntsNo);
  }
  await user.save();
  
  res.json({message: `${diet.dietNm} 식단이 내 식단 목록에 추가되었습니다.`});
});

module.exports = router;