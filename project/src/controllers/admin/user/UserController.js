const router = require("express").Router();
const Diet = require("../../../models/Diet");
const Exercise = require("../../../models/Exercise");
const User = require("../../../models/User");

// 사용자 목록 페이지
router.get("/", async (req, res) => {
  let { searchOption, searchKeyword } = req.query;
  let pageNo;
  let message = "";
  let errorMessage = "";

  // 현재페이지가 없으면 1로 지정
  if (req.query.pageNo) pageNo = parseInt(req.query.pageNo);
  else pageNo = 1;

  // 검색 키워드가 있으면 검색 조건 처리
  let findExpr = {};
  if (searchKeyword) {
    //  사용자 ID는 문자열 포함하는지 비교.
    if (searchOption === "username") {
      findExpr[searchOption] = { $regex: `.*${searchKeyword}.*` };
    }
  }

  let userList = await User.find(findExpr).sort({age: 1}).lean();

  // 페이지마다 사용자를 10개씩 보여준다.
  let numOfUser = userList.length;
  let minContent = (pageNo - 1) * 10;
  let maxContent = minContent + 10;

  // 클라이언트에 보여줄 메시지가 있으면 처리
  if (req.session.message) {
    message = req.session.message;
    req.session.message = null;
  }
  if (req.session.errorMessage) {
    errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
  }

  res.render("admin/main.ejs", {
    pageName: "userList",
    sectionName: "user",
    message, // 화면에 보여줄 메시지
    errorMessage,
    userList: userList.slice(minContent, maxContent), // 보여줄 음식 목록
    numOfListItem: numOfUser, // 보여줄 음식 목록 갯수
    pageNo, // 보고 있는 페이지 번호
    searchOption, // 검색 타입
    searchKeyword, // 검색 키워드,
  });
});

// 사용자의 식단 목록 페이지
router.get("/diet", async (req, res) => {
  let { username, pageNo } = req.query;

  let user = await User.findOne({username});
  let dietList = await Diet.find({cntntsNo: { $in: user.myDiet } });

  res.render("admin/main.ejs", {
    pageName: "userDietList",
    sectionName: "user",
    user,
    pageNo,
    dietList,
  });
});

// 사용자의 운동 목록 페이지
router.get("/exercise", async (req, res) => {
  let { username, pageNo } = req.query;
  let message = "";

  let user = await User.findOne({username});
  let exerciseList = await Exercise.find({ExcntntsNo: { $in: user.myExercise } });

  res.render("admin/main.ejs", {
    pageName: "userExerciseList",
    sectionName: "user",
    user,
    pageNo,
    exerciseList,
    message,
  });
});

// 사용자 삭제 처리
router.post("/removal/:username", async (req, res) => {
  let { username } = req.params;
  let user = await User.findOne({username});

  if (user) {
    await User.findOneAndRemove({username});
    req.session.message = `사용자 ${username} 삭제 완료!`;
  } else {
    req.session.errorMessage = `사용자 ${username} 는 없습니다.`;
  }

  res.redirect("/admin/user");
});

module.exports = router;