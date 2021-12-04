const router = require("express").Router();
const multer = require("multer");
const Food = require("../../models/Food");
const Diet = require("../../models/Diet");

// multer는 클라이언트로부터 넘어오는 multipart/form-data 형식을 파싱할 수 있다.
// 즉, 파일 데이터를 받을 수 있다.
const storage = multer.diskStorage({
  // 파일이 저장될 폴더 경로
  destination: async function (req, file, cb) {
    let directory = path.join(process.env.INIT_CWD, "public/testUpload/");

    // 폴더가 아직 없으면 폴더를 생성한다.
    await fsPromises.access(directory, fs.constants.F_OK).catch(async () => {
      try {
        await fsPromises.mkdir(directory, { recursive: true });
      } catch (err) {
        console.log(err);
      }
    });
    
    // 파일이 저장될 폴더 지정
    cb(null, "public/testUpload/");
  },

  // 저장될 파일 이름
  filename: function(req, file, cb) {
    let mimeType;

    // 파일 형식에 따라서 확장자를 붙여준다.
    switch (file.mimetype) {
      case "image/jpeg":
        mimeType = "jpg";
        break;
      case "image/png":
        mimeType = "png";
        break;
      default:
        mimeType = "";
        break;
    }

    cb(null, file.fieldname + "_" + Date.now() + "." + mimeType);
  }
});
const upload = multer({storage: storage});

// 음식 목록 페이지
router.get("/", async (req, res) => {
  let { searchOption, searchKeyword } = req.query;
  let pageNo;
  
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

  res.render("admin/main.ejs", {
    pageName: "foodList",
    sectionName: "food",
    foodList: foodList.slice(minContent, maxContent), // 보여줄 음식 목록
    numOfListItem: numOfFood, // 보여줄 음식 목록 갯수
    pageNo: pageNo, // 보고 있는 페이지 번호
    searchOption, searchOption, // 검색 타입
    searchKeyword: searchKeyword // 검색 키워드
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
  });
});

// 음식 생성 처리
router.post("/editor", async (req, res) => {
  console.log("POST food/editor");
  console.log(req.body);
  
  res.render("admin/main.ejs", {
    pageName: "main",
    sectionName: "food",
  });
});

module.exports = router;