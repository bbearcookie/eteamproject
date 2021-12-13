const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const Exercise = require("../../../models/Exercise");

module.exports.config = function (common) {
  // 운동 생성 페이지
  router.get("/", async (req, res) => {
    let { previousPage } = req.query;

    
    res.render("admin/main.ejs", {
      pageName: "exerciseWriter",
      sectionName: "exercise",
      previousPage,
      checkErrorMessage: "",
      ExcntntsNo: "",
      ExcNm: "",
      ExcCn: "",
      ExcType:"",
      Excplace:"",
      Exccnt: "",
      Excintensity:"",
      HowtoExcInfo: ""
    });
  });

  // 운동 생성 처리 전에 ajax로 유효성 검사
  router.post("/check", async (req, res) => {
    const { ExcntntsNo, } = req.body;
    let checkErrorMessage = "";

    // 해당 운동코드가 이미 있으면 다시 입력 받아야함.
    let exercise = await Exercise.findOne({ExcntntsNo});
    if (exercise) {
      checkErrorMessage = "이미 있는 운동코드입니다.";
    }

    res.json({
      checkErrorMessage
    });
  });

  // 운동 생성 처리
  router.post("/", common.upload.single("imageFile"), async (req, res) => {
    const { ExcntntsNo, ExcNm, ExcCn, ExcType, Excplace, Excintensity, Exccnt, HowtoExcInfo, previousPage } = req.body;
    const imgFile = req.file;
    let destFileName = "";

    try {
      // 임시 이름으로 다운받은 이미지가 있으면 이미지 파일명 변경
      if (imgFile) {
        destFileName = ExcntntsNo + "." + common.getExtName(imgFile.mimetype);
        await fsPromises.rename(imgFile.path, path.join(imgFile.destination, destFileName));
      }
    
      let exercise = new Exercise({
        ExcntntsNo,
        ExcNm,
        ExcType,
        Excplace,
        Excintensity,
        Exccnt,
        HowtoExcInfo,
        ExcCn,
        rtnStreFileNm: destFileName,
        registDt: Date.now()
      });

      await exercise.save();

      // 생성 성공했으면 exerciseList 페이지 보여줌.
      req.session.message = "운동 생성 완료!";
    } catch (err) {
      console.log(err);
    }

    res.redirect("/admin/exercise");
  });

}

module.exports.router = router;