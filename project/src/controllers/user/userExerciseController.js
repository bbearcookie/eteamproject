const router = require("express").Router();
const Exercise = require("../../../models/Exercise");
const User = require("../../../models/User");


/* 사용자가 내 운동을 조회하고/삭제하고/전체초기화(전체삭제)하는 기능을 포함한다.
삭제:내 운동에서 특정 운동 제거
->삭제 버튼 눌린 운동을->User의 myExercise에서 제거
전체초기화:Exercise의 myExercise 배열 초기화

*/

  //내 운동 보여줌
  router.get("/myExercise", async (req, res) => {
    
// <<<<<<<<<<<<<<< MerryChristmas
    //ExcntntsNo == myExercise배열에 저장된 정수인 경우 출력
//     let myExerciseList = await Exercise.find({ExcntntsNo:User.myExercise});
// <<<<<<<<<<<<<<<
    
    let user = await User.findOne({username: req.user.username}); // 사용자의 정보를 가져옴. (현재 로그인한 사용자의 정보는 req.user 로 가져올 수 있음.)
    let myExerciseList = await Exercise.find({ ExcntntsNo: { $in: user.myExercise }}); // 사용자의 내 식단에 포함된 식단들의 모든 정보를 가져옴.
    

  res.render("user/myExercise", {
    myExerciseList
  });
});

// 내 운동에서 삭제 처리
router.post("/myExercise/remover/:ExcntntsNo", async (req, res) => {
  let { ExcntntsNo } = req.params;

  try {
// <<<<<<<<<<<<<<< MerryChristmas
//     let myExercise2 = await User.findOne({ExcntntsNo});

//     if (myExercise2) {
//       await User.findOneAndRemove({ExcntntsNo});
//     }
// <<<<<<<<<<<<<<<
    
    let user = await User.findOne({username: req.user.username}); // 사용자의 정보를 가져옴.
    
    // User 스키마의 myExercise 필드에 지우려는 운동코드인 myExercise 값이 존재한다면 배열에서 제거.
    // 실제로 동작시켜보지는 않아서 나중에 테스트 해봐야 할듯 합니다!!
    let index = user.myExercise.indexOf(myDiet);
    if (index !== -1) {
      user.myExercise.splice(index, 1);
    }
    
    // 변경된 내용 DB에 적용 (여기서 변경된건 User 스키마 속의 myExercise 값)
    await user.save();

  } catch (err) {
    console.log(err);
  }

  req.session.message = "운동 삭제 완료!";
  res.redirect("/user/myExercise");
});

//전체삭제(초기화)
router.post("/myExercise/remover", async (req, res) => {
//   let { myExercise } = req.params;

  try {
// <<<<<<<<<<<<<<< MerryChristmas
//     let myExercise2 = await User.find({myExercise});

//     if (myExercise2) {
//         User.myExercise.length=0; //myDiet 배열의 length를 0으로 설정하여 초기화함
//     }
// <<<<<<<<<<<<<<<
    
    let user = await User.findOne({username: req.user.username}); // 사용자의 정보를 가져옴.
    user.myExercise = []; // 사용자의 내 운동 모두 초기화
    await user.save(); // 변경된 내용 DB에 적용

  } catch (err) {
    console.log(err);
  }

  req.session.message = "내 운동 전체삭제 완료!";
  res.redirect("/user/myExercise");
});

module.exports = router;
