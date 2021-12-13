const router = require("express").Router();
const Diet = require("../../../models/Diet");
const User = require("../../../models/User");


/* 사용자가 내 식단을 조회하고/삭제하고/전체초기화(전체삭제)하는 기능을 포함한다.
삭제:내식단에서 특정 식단 제거
->삭제 버튼 눌린 식단을->User의 myDiet에서 제거
전체초기화:User의 myDiet 배열 초기화

*/

  //내 식단 보여줌
  router.get("/myDiet", async (req, res) => {

    //cntntsNo == myDiet배열에 저장된 정수인 경우 출력
    let myDietList = await Diet.find({cntntsNo:User.myDiet});
    //cntntsNo:User.myDiet는 Diet의 cntntsNo가 User의 myDiet과 일치하는 경우 cntntsNo를 find하는 것을 의도하였는데 이렇게 하는 게 맞을지
    //아니면 위에서 let mydietconditon = await User.find({myDiet}); 라고 선언해서 값을 집어넣은 뒤에 let myDietList = await Diet.find({cntntsNo:mydietcondition}); 이라고 해야할지 모르겠습니다
    //혹시 보시면 확인부탁드립니다 죄송합니다...

  res.render("user/myDiet", {
    pageName: "myDiet",
    sectionName: "myDiet",
    myDietList
  });
});

// 내 식단에서 삭제 처리
router.post("/user/myDiet", async (req, res) => {
  let { myDiet } = req.params;

  try {
    let mydiet2 = await User.findOne({myDiet});

    if (mydiet2) {
      await User.findOneAndRemove({myDiet});
    }

  } catch (err) {
    console.log(err);
  }

  req.session.message = "식단 삭제 완료!";
  res.redirect("/user/myDiet");
});

//내 식단 전체삭제(초기화)
router.post("/user/myDiet", async (req, res) => {
  let { myDiet } = req.params;

  try {
    let mydiet2 = await User.find({myDiet});

    if (mydiet2) {
      User.myDiet.length=0; //myDiet 배열의 length를 0으로 설정하여 초기화함
    }

  } catch (err) {
    console.log(err);
  }

  req.session.message = "내 식단 전체삭제 완료!";
  res.redirect("/user/myDiet");
});



module.exports = router;