const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const Exercise = require("../../../models/Exercise");

// 파일의 mimeType에 따른 확장자를 반환하는 함수
function getExtName(mimeType) {
  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  if (mimeType === "image/png") {
    return "png";
  }

  return "";
}

// 이미지 파일의 디렉터리 경로
let imgDirectory = path.join(process.env.INIT_CWD, "public/image/exercise/normal/");

// multer는 클라이언트로부터 넘어오는 multipart/form-data 형식을 파싱할 수 있다.
const storage = multer.diskStorage({
  // 파일이 저장될 폴더 경로
  destination: async function (req, file, cb) {

    // 폴더가 아직 없으면 폴더를 생성한다.
    await fsPromises.access(imgDirectory, fs.constants.F_OK).catch(async () => {
      try {
        await fsPromises.mkdir(imgDirectory, { recursive: true });
      } catch (err) {
        console.log(err);
      }
    });
    
    // 파일이 저장될 폴더 지정
    cb(null, imgDirectory);
  },

  // 저장될 파일 이름
  filename: function(req, file, cb) {
    // 파일 형식에 따라서 확장자를 붙여준다.
    let mimeType = getExtName(file.mimetype);
    cb(null, file.fieldname + "_" + req.user.username + "." + mimeType);
  }
});
const upload = multer({storage: storage});

// 하위 컨트롤러에서도 사용하는 공통 부분을 객체로 줌.
let common = {
  // 파일의 mimeType에 따른 확장자를 반환하는 함수
  getExtName: getExtName,
  upload: upload
}

// 운동 목록 페이지
router.get("/", async (req, res) => {

  let { searchOption, searchKeyword } = req.query;
  let pageNo;
  let message = "";

  
  // 현재페이지가 없으면 1로 지정
  if (req.query.pageNo) pageNo = parseInt(req.query.pageNo);
  else pageNo = 1;


  // 검색 키워드가 있으면 검색 조건 처리
  let findExpr = {};
  if (searchKeyword) {
    // 운동명, 분류, 장소, 강도, 인원이  문자열 포함하는지 비교.
    if (searchOption === "ExcNm" || searchOption === "ExcType" || searchOption === "ExcPlace" || searchOption === "Excintensity" || searchOption === "Exccnt") {
      findExpr[searchOption] = { $regex: `.*${searchKeyword}.*` };
    }

    // 운동코드는 정확히 일치하는지 비교. 키워드가 숫자가 아니면 아무것도 반환안함.
    if (searchOption === "ExcntntsNo") {
      let numberedKeyword = /^\d+$/.exec(searchKeyword);
      if (numberedKeyword) {
        findExpr[searchOption] = { $eq: parseInt(numberedKeyword[0]) };
      } else {
        findExpr[searchOption] = { $eq: -1 };
      }
    }
  }

  let exerciseList = await Exercise.find(findExpr).sort({ExcntntsNo: 1}).lean();

  // 페이지마다 운동을 10개씩 보여준다.
  let numOfExercise = exerciseList.length;
  let minContent = (pageNo - 1) * 10;
  let maxContent = minContent + 10;

  // 클라이언트에 보여줄 메시지가 있으면 처리
  if (req.session.message) {
    message = req.session.message;
    req.session.message = null;
  }

  res.render("admin/main.ejs", {
    pageName: "exerciseList",
    sectionName: "exercise",
    message, // 화면에 보여줄 메시지
    exerciseList: exerciseList.slice(minContent, maxContent), // 보여줄 운동 목록
    numOfListItem: numOfExercise, // 보여줄 운동 목록 갯수
    pageNo, // 보고 있는 페이지 번호
    searchOption, // 검색 타입
    searchKeyword, // 검색 키워드,
  });
});

// 운동 상세 페이지
router.get("/detail/:ExcntntsNo", async (req, res) => {
  let { pageNo, searchOption, searchKeyword } = req.query;
  let { ExcntntsNo } = req.params;
  ExcntntsNo = parseInt(ExcntntsNo);

  let exercise = await Exercise.findOne({ExcntntsNo: ExcntntsNo});
  let notFoundError = false;
  if (!exercise) {
    notFoundError = true;
  }

  res.render("admin/main.ejs", {
    pageName: "exerciseDetail",
    sectionName: "exercise",
    pageNo: pageNo, // 보고 있는 페이지 번호
    searchOption, searchOption, // 검색 타입
    searchKeyword: searchKeyword, // 검색 키워드
    notFoundError,
    exercise,
  });
});

// 운동 생성 페이지
const exerciseWriterController = require("./ExerciseWriterController");
exerciseWriterController.config(common);
router.use("/writer", exerciseWriterController.router);

// 운동 수정 페이지
const exerciseEditorController = require("./ExerciseEditorController");
exerciseEditorController.config(common);
router.use("/editor", exerciseEditorController.router);

// 운동 제거 처리
router.post("/remover/:ExcntntsNo", async (req, res) => {
  let { ExcntntsNo } = req.params;
  let { previousPage } = req.body;
  
  try {
    let exercise = await Exercise.findOne({ExcntntsNo});

    if (exercise) {
      // 이미지 파일 있으면 제거
      let imgPath = path.join(imgDirectory, exercise.rtnStreFileNm);
      fsPromises.access(imgPath, fs.constants.F_OK).then(async () => {
        await fsPromises.rm(imgPath);
      }).catch(() => {});

      await Exercise.findOneAndRemove({ExcntntsNo});
    }
  } catch (err) {
    console.log(err);
  }

  if (previousPage) {
    if (previousPage.includes("/admin/diet/detail")) {
      return res.redirect(previousPage);
    }
  }

  req.session.message = "운동 삭제 완료!";
  res.redirect("/admin/exercise");
});

module.exports = router;