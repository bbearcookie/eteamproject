const router = require("express").Router();
const Diet = require("../../models/Diet");
const User = require("../../models/User");


/* 사용자가 내 식단을 조회하고/삭제하고/전체초기화(전체삭제)하는 기능을 포함한다.
삭제:내식단에서 특정 식단 제거
->삭제 버튼 눌린 식단을->User의 myDiet에서 제거
전체초기화:User의 myDiet 배열 초기화

*/

  // 내 식단 보여줌
  router.get("/myDiet", async (req, res) => {
    let message = "";
    let user = await User.findOne({username: req.user.username}); // 사용자의 정보를 가져옴. (현재 로그인한 사용자의 정보는 req.user 로 가져올 수 있음.)
    let myDietList = await Diet.find({ cntntsNo: { $in: user.myDiet }}); // 사용자의 내 식단에 포함된 식단들의 모든 정보를 가져옴.

    // 보여줄 메시지 있으면 처리
    if (req.session.message) {
      message = req.session.message;
      req.session.message = null;
    }

    res.render("user/myDiet", {
      myDietList,
      message
    });
});

// 내 식단에서 특정 식단 삭제 처리
router.post("/myDiet/remover/:cntntsNo", async (req, res) => {
  // 여기서 cntntsNo는 사용자의 내 식단에서 삭제하려는 cntntsNo 값임.
  let { cntntsNo } = req.params;

  try {
    
    let user = await User.findOne({username: req.user.username}); // 사용자의 정보를 가져옴.
    
    // User 스키마의 myDiet 필드에 지우려는 식단코드인 myDiet 값이 존재한다면 배열에서 제거.
    let index = user.myDiet.indexOf(cntntsNo);  //myDiet 값이 읽히지 않는다고 확인됩니다
    if (index !== -1) {
      user.myDiet.splice(index, 1);
    }
    
    // 변경된 내용 DB에 적용 (여기서 변경된건 User 스키마 속의 myDiet 값)
    await user.save();
  } catch (err) {
    console.log(err);
  }

  req.session.message = "식단 삭제 완료!";
  res.redirect("/myDiet");
});

//내 식단 전체삭제(초기화)
router.post("/myDiet/remover", async (req, res) => {
  let { myDiet } = req.params;

  try {
    
    let user = await User.findOne({username: req.user.username}); // 사용자의 정보를 가져옴.
    user.myDiet = []; // 사용자의 내 식단 모두 초기화
    await user.save(); // 변경된 내용 DB에 적용

  } catch (err) {
    console.log(err);
  }

  req.session.message = "내 식단 전체삭제 완료!";
  res.redirect("/myDiet");
});



module.exports = router;
