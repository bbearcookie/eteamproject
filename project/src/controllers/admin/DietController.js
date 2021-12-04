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

// 식단 목록 보여줌
router.get("/", async (req, res) => {
  let dietList = await Diet.find({}).lean();
  res.render("pages/admin/dietlist.hbs", {
    dietList: dietList
  });
});

// 식단 상세 정보 보여줌
router.get("/detail/:cntntsNo", async (req, res) => {
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