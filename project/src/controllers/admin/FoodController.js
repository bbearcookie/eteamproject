const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const Food = require("../../models/Food");
const Diet = require("../../models/Diet");

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

// multer는 클라이언트로부터 넘어오는 multipart/form-data 형식을 파싱할 수 있다.
// 즉, 파일 데이터를 받을 수 있다.
const storage = multer.diskStorage({
  // 파일이 저장될 폴더 경로
  destination: async function (req, file, cb) {
    let directory = path.join(process.env.INIT_CWD, "public/image/food/normal/");

    // 폴더가 아직 없으면 폴더를 생성한다.
    await fsPromises.access(directory, fs.constants.F_OK).catch(async () => {
      try {
        await fsPromises.mkdir(directory, { recursive: true });
      } catch (err) {
        console.log(err);
      }
    });
    
    // 파일이 저장될 폴더 지정
    cb(null, directory);
  },

  // 저장될 파일 이름
  filename: function(req, file, cb) {
    // 파일 형식에 따라서 확장자를 붙여준다.
    let mimeType = getExtName(file.mimetype);
    cb(null, file.fieldname + "_" + req.user.username + "." + mimeType);
  }
});
const upload = multer({storage: storage});



// 음식 목록 페이지
router.get("/", async (req, res) => {
  let { searchOption, searchKeyword } = req.query;
  let pageNo;
  let message = "";
  
  // 현재페이지가 없으면 1로 지정
  if (req.query.pageNo) pageNo = parseInt(req.query.pageNo);
  else pageNo = 1;

  // 음식 코드를 가지고 오름차순 정렬
  let findExpr = {};

  // 검색 키워드가 있으면 검색 조건 처리
  if (searchKeyword) {
    //  음식명과 재료정보는 문자열 포함하는지 비교.
    if (searchOption === "fdNm" || searchOption === "matrlInfo") {
      findExpr[searchOption] = { $regex: `.*${searchKeyword}.*` };
    }

    // 식단코드는 정확히 일치하는지 비교. 키워드가 숫자가 아니면 아무것도 반환안함.
    if (searchOption === "fdCntntsNo") {
      let numberedKeyword = /^\d+$/.exec(searchKeyword);
      if (numberedKeyword) {
        findExpr[searchOption] = { $eq: parseInt(numberedKeyword[0]) };
      } else {
        findExpr[searchOption] = { $eq: -1 };
      }
    }
  }

  let foodList = await Food.find(findExpr).sort({fdCntntsNo: 1}).lean();

  // 페이지마다 음식을 10개씩 보여준다.
  let numOfFood = foodList.length;
  let minContent = (pageNo - 1) * 10;
  let maxContent = minContent + 10;

  // 클라이언트에 보여줄 메시지가 있으면 처리
  if (req.session.toastMessage) {
    message = req.session.toastMessage;
    req.session.toastMessage = null;
  }

  res.render("admin/main.ejs", {
    pageName: "foodList",
    sectionName: "food",
    foodList: foodList.slice(minContent, maxContent), // 보여줄 음식 목록
    numOfListItem: numOfFood, // 보여줄 음식 목록 갯수
    pageNo, // 보고 있는 페이지 번호
    searchOption, // 검색 타입
    searchKeyword, // 검색 키워드,
    message // 화면에 보여줄 toast 메시지
  });
});

// 음식 상세 페이지
router.get("/detail/:fdCntntsNo", async (req, res) => {
  let { pageNo, searchOption, searchKeyword } = req.query;

  let { fdCntntsNo } = req.params;
  fdCntntsNo = parseInt(fdCntntsNo);

  let food = await Food.findOne({fdCntntsNo: fdCntntsNo});
  let error = false;
  if (food) {
    // console.log(food);
  } else {
    error = true;
  }

  res.render("admin/main.ejs", {
    pageName: "foodDetail",
    sectionName: "food",
    food,
    error,
    pageNo: pageNo, // 보고 있는 페이지 번호
    searchOption, searchOption, // 검색 타입
    searchKeyword: searchKeyword // 검색 키워드
  });
});

// 음식 생성 페이지
router.get("/editor", async (req, res) => {
  res.render("admin/main.ejs", {
    pageName: "foodEditor",
    sectionName: "food",
    errorMessage: "",
    fdCntntsNo: "",
    cntntsNo: "",
    matrlInfo: "",
    dietCn: ""
  });
});

// 음식 생성 처리 전에 ajax로 유효성 검사
router.post("/editor/check", async (req, res) => {
  const { fdCntntsNo, cntntsNo } = req.body;
  let error = false;
  let errorMessage = "";

  // 해당 음식코드가 이미 있으면 다시 입력 받아야함.
  let food = await Food.findOne({fdCntntsNo});
  if (food) {
    error = true;
    errorMessage = "이미 있는 음식코드입니다.";
  }

  // 해당 식단코드로 저장된 식단이 없다면 사용자로부터 입력 다시 받아야 함.
  let diet = await Diet.findOne({cntntsNo});
  if (!diet) {
    error = true;
    errorMessage = "이 음식이 포함되려는 식단코드가 아직 없습니다.";
  }

  res.json({
    error,
    errorMessage
  });
});

// 음식 생성 처리
router.post("/editor", upload.single("imageFile"), async (req, res) => {
  const { fdCntntsNo, cntntsNo, matrlInfo, dietCn } = req.body;
  const imgFile = req.file;
  console.log("POST /food/editor");

  // 성공적으로 DB에 저장됐으면 이미지 파일명 변경
  if (imgFile) {
    await fsPromises.rename(imgFile.path, path.join(imgFile.destination, fdCntntsNo + "." + getExtName(imgFile.mimetype)));
  }

  // 생성 성공했으면 foodList 페이지 보여줌.
  req.session.toastMessage = "식단 생성 완료!";
  res.redirect("/admin/food");
});

module.exports = router;