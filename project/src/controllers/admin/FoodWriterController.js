const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const Food = require("../../models/Food");
const Diet = require("../../models/Diet");

module.exports.config = function (common) {
  // 음식 생성 페이지
  router.get("/", async (req, res) => {
    res.render("admin/main.ejs", {
      pageName: "foodWriter",
      sectionName: "food",
      checkErrorMessage: "",
      fdCntntsNo: "",
      cntntsNo: "",
      fdNm: "",
      matrlInfo: "",
      ckngMthInfo: ""
    });
  });

  // 음식 생성 처리 전에 ajax로 유효성 검사
  router.post("/check", async (req, res) => {
    const { fdCntntsNo, cntntsNo } = req.body;
    let checkErrorMessage = "";

    // 해당 음식코드가 이미 있으면 다시 입력 받아야함.
    let food = await Food.findOne({fdCntntsNo});
    if (food) {
      checkErrorMessage = "이미 있는 음식코드입니다.";
    }

    // 해당 식단코드로 저장된 식단이 없다면 사용자로부터 입력 다시 받아야 함.
    let diet = await Diet.findOne({cntntsNo});
    if (!diet) {
      checkErrorMessage = "해당 식단코드가 아직 없습니다.";
    }

    res.json({
      checkErrorMessage
    });
  });

  // 음식 생성 처리
  router.post("/", common.upload.single("imageFile"), async (req, res) => {
    const { fdCntntsNo, cntntsNo, fdNm, matrlInfo, ckngMthInfo } = req.body;
    const imgFile = req.file;
    let destFileName = "";

    try {
      // 임시 이름으로 다운받은 이미지가 있으면 이미지 파일명 변경
      if (imgFile) {
        destFileName = fdCntntsNo + "." + common.getExtName(imgFile.mimetype);
        await fsPromises.rename(imgFile.path, path.join(imgFile.destination, destFileName));
      }
    
      let food = new Food({
        fdCntntsNo,
        cntntsNo,
        fdNm,
        matrlInfo,
        ckngMthInfo,
        rtnStreFileNm: destFileName,
        registDt: Date.now()
      });

      await food.save();

      // 생성 성공했으면 foodList 페이지 보여줌.
      req.session.message = "음식 생성 완료!";
    } catch (err) {
      console.log(err);
    }

    res.redirect("/admin/food");
  });

}

module.exports.router = router;