const router = require("express").Router();
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const multer = require("multer");
const adminApiController = require("./AdminApiController");
const adminService = require("../services/AdminService");
const Food = require("../models/Food");
const Diet = require("../models/Diet");

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

// 관리자 접근 권한 확인
router.use("/", async (req, res, next) => {
  if (!adminService.isAdmin(req.user)) {
    res.status(403).json({error: "관리자가 아닙니다."});
    return;
  }
  next();
});

// 농사로API 관련 기능들
router.use("/api", adminApiController);

// 관리자 메인 페이지 보여줌
router.get("/", async (req, res) => {
  res.render("pages/admin/main.ejs", {
    pageName: "main",
    sectionName: "main"
  });
});

// 식단 목록 보여줌
router.get("/diet", async (req, res) => {
  let dietList = await Diet.find({}).lean();
  res.render("pages/admin/dietlist.hbs", {
    dietList: dietList
  });
});

// 식단 상세 정보 보여줌
router.get("/diet/detail/:cntntsNo", async (req, res) => {
  const { cntntsNo } = req.params;

  try {
    let diet = await Diet.findOne({cntntsNo: cntntsNo}).lean();
    let foodList = await Food.find({cntntsNo: cntntsNo}).lean();

    // 해당 식단이 DB에 있으면 보여주고 없으면 404 상태코드 보내줌.
    if (diet) {
      res.render("pages/admin/dietDetail.hbs", {
        diet: diet,
        foodList: foodList
      });
    } else {
      res.status(404).send(`${cntntsNo} 식단은 없습니다.`);
    }
  } catch (err) {
    console.log(err);
  }
});

// 식단 생성 페이지 보여줌
router.get("/diet/editor", async (req, res) => {
});

// 식단 수정 페이지 보여줌
router.get("/diet/editor/:cntntsNo", async (req, res) => {
  
});

// 식단 생성 요청
router.post("/diet/editor", upload.single("imageFile"), async (req, res) => {
  console.log(req.body);
  res.send("Haha");
});

// 식단 수정 요청
router.post("/diet/editor/:cntntsNo", async (req, res) => {

});

// 식단 삭제 요청
router.delete("/diet/:cntntsNo", async (req, res) => {

});

// 음식 목록 페이지
router.get("/food", async (req, res) => {
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

  res.render("pages/admin/main", {
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
router.get("/food/detail/:fdCntntsNo", async (req, res) => {
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

  res.render("pages/admin/main", {
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
router.get("/food/editor", async (req, res) => {
  res.render("pages/admin/main", {
    pageName: "foodEditor",
    sectionName: "food",
  });
});

// 음식 생성 처리
router.post("/food/editor", async (req, res) => {
  console.log("POST food/editor");
  
  res.render("pages/admin/main", {
    pageName: "main",
    sectionName: "food",
  })
});

// 농사로 데이터 페이지 보여줌
router.get("/nongsaro", async (req, res) => {
  res.render("pages/admin/main", {
    pageName: "nongsaro",
    sectionName: "nongsaro"
  });
});

module.exports = router;