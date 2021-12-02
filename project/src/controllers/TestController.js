const router = require("express").Router();
const multer = require("multer");

/*
* 이 파일은
* 기능을 실제로 구현하기 전에
* 테스트 해보고 싶은 경우가 있을 때
* /test/~~~ URL에 접근하여 사용해볼 수 있게끔
* 만들어놓은 테스트용 컨트롤러이다.
*
*/

// multer는 클라이언트로부터 넘어오는 multipart/form-data 형식을 파싱할 수 있다.
// 즉, 파일 데이터를 받을 수 있다.
const storage = multer.diskStorage({
  // 파일이 저장될 폴더 경로
  destination: function (req, file, cb) {
    cb(null, "public/testUpload/");
  },

  // 저장될 파일 이름
  filename: function(req, file, cb) {
    let mimeType;

    // 파일 형식에 따라서 확장자를 붙여준다.
    switch (file.mimetype) {
      case "text/plain":
        mimeType = "txt";
        break;
      default:
        mimeType = "";
        break;
    }

    cb(null, file.fieldname + "_" + Date.now() + "." + mimeType);
  }
})
const upload = multer({storage: storage});

// 세션 테스트 용. count 변수를 1 증가시킴.
router.get("/count", async (req, res) => {
  if (req.session.count) {
    req.session.count = req.session.count + 1;
  } else {
    req.session.count = 1;
  }
  let count = req.session.count;
  res.send(`You have joined ${count} times.`)
});

// multer로 데이터 받는거를 테스트할 페이지 보여줌.
router.get("/multer", async (req, res) => {
  res.render("pages/test/multer.hbs");
});

// multer로 데이터 받는거 테스트
router.post("/multer", upload.single("formFile"), async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  res.send("post 요청 완료");
});

module.exports = router;