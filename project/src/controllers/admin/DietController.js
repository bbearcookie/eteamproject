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

// 이미지 파일의 디렉터리 경로
let imgDirectory = path.join(process.env.INIT_CWD, "public/image/diet/normal/");

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

// 식단 목록 보여줌
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
    //  음식명과 재료정보는 문자열 포함하는지 비교.
    if (searchOption === "dietNm" || searchOption === "dietCn") {
      findExpr[searchOption] = { $regex: `.*${searchKeyword}.*` };
    }

    // 식단코드는 정확히 일치하는지 비교. 키워드가 숫자가 아니면 아무것도 반환안함.
    if (searchOption === "cntntsNo") {
      let numberedKeyword = /^\d+$/.exec(searchKeyword);
      if (numberedKeyword) {
        findExpr[searchOption] = { $eq: parseInt(numberedKeyword[0]) };
      } else {
        findExpr[searchOption] = { $eq: -1 };
      }
    }
  }

  let dietList = await Diet.find(findExpr).sort({cntntsNo: 1}).lean();

  // 페이지마다 음식을 10개씩 보여준다.
  let minContent = (pageNo - 1) * 10;
  let maxContent = minContent + 10;

  // 클라이언트에 보여줄 메시지가 있으면 처리
  if (req.session.message) {
    message = req.session.message;
    req.session.message = null;
  }

  res.render("admin/main", {
    pageName: "dietList",
    sectionName: "diet",
    message: "",
    dietList: dietList.slice(minContent, maxContent), // 보여줄 음식 목록
    numOfListItem: dietList.length, // 보여줄 음식 목록 갯수
    pageNo, // 보고 있는 페이지 번호
    searchOption, // 검색 타입
    searchKeyword, // 검색 키워드,
  });
});

// 식단 상세 정보 보여줌
router.get("/detail/:cntntsNo", async (req, res) => {
  let { pageNo, searchOption, searchKeyword } = req.query;
  let { cntntsNo } = req.params;

  let diet = await Diet.findOne({cntntsNo});
  let notFoundError = false;
  if (!diet) {
    notFoundError = true;
  }

  let foodList = await Food.find({cntntsNo});

  res.render("admin/main", {
    pageName: "dietDetail",
    sectionName: "diet",
    message: "",
    pageNo, // 보고 있는 페이지 번호
    searchOption, // 검색 타입
    searchKeyword, // 검색 키워드,
    notFoundError,
    diet,
    foodList
  });
});

// 식단 생성 페이지
const dietWriterController = require("./DietWriterController");
dietWriterController.config(common);
router.use("/writer", dietWriterController.router);

// 식단 생성 페이지 보여줌
router.get("/editor", async (req, res) => {
});

// 식단 수정 페이지 보여줌
router.get("/editor/:cntntsNo", async (req, res) => {
  
});

// 식단 생성 요청
router.post("/editor", upload.single("imageFile"), async (req, res) => {
  console.log(req.body);
  res.send("Haha");
});

// 식단 수정 요청
router.post("/editor/:cntntsNo", async (req, res) => {

});

// 식단 삭제 요청
router.delete("/:cntntsNo", async (req, res) => {

});

module.exports = router;