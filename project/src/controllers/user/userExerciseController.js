const router = require("express").Router();
const Exercise = require("../../../models/Exercise");
const User = require("../../../models/User");


/* 사용자가 내 운동을 조회하고/삭제하고/전체초기화(전체삭제)하는 기능을 포함한다.
삭제:내 운동에서 특정 운동 제거
->삭제 버튼 눌린 운동을->User의 myExercise에서 제거
전체초기화:Exercise의 myExercise 배열 초기화

*/

  //내 식단 보여줌
  router.get("/myExercise", async (req, res) => {

    //ExcntntsNo == myExercise배열에 저장된 정수인 경우 출력
    let myExerciseList = await Exercise.find({ExcntntsNo:User.myExercise});

  res.render("user/myExercise", {
    pageName: "myExercise",
    sectionName: "myExercise",
    myExerciseList
  });
});

// 내 운동에서 삭제 처리
router.post("/user/myExercise", async (req, res) => {
  let { myExercise } = req.params;

  try {
    let myExercise2 = await User.findOne({myExercise});

    if (myExercise2) {
      await User.findOneAndRemove({myExercise});
    }

  } catch (err) {
    console.log(err);
  }

  req.session.message = "운동 삭제 완료!";
  res.redirect("/user/myExercise");
});

//전체삭제(초기화)
router.post("/user/myExercise", async (req, res) => {
  let { myExercise } = req.params;

  try {
    let myExercise2 = await User.find({myExercise});

    if (myExercise2) {
        User.myExercise.length=0; //myDiet 배열의 length를 0으로 설정하여 초기화함
    }

  } catch (err) {
    console.log(err);
  }

  req.session.message = "내 운동 전체삭제 완료!";
  res.redirect("/user/myExercise");
});

module.exports = router;