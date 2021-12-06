const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const Food = require("../../models/Food");
const Diet = require("../../models/Diet");

module.exports.config = function (common) {

  // 식단 생성 페이지
  router.get("/", async (req, res) => {
    res.render("admin/main.ejs", {
      pageName: "dietWriter",
      sectionName: "diet",
      checkErrorMessage: "",
      fdCntntsNo: "",
      cntntsNo: "",
      fdNm: "",
      matrlInfo: "",
      ckngMthInfo: ""
    });
  });

  // 식단 생성 처리 전에 ajax로 유효성 검사
  router.post("/check", async (req, res) => {
    const { cntntsNo } = req.body;
    let checkErrorMessage = "";

    // 해당 식단코드가 이미 있으면 다시 입력 받아야함.
    let diet = await Diet.findOne({cntntsNo});
    if (diet) { checkErrorMessage = "이미 있는 식단코드입니다." }

    res.json({checkErrorMessage});
  });

  // 식단 생성 처리
  router.post("/", common.upload.single("imageFile"), async (req, res) => {
    let { cntntsNo, dietSeCode, dietNm, clriInfo, crbhInfo, protInfo, ntrfsInfo, dietCn } = req.body;
    const imgFile = req.file;
    let destFileName = "";
    let dietNtrsmallInfo = "";

    // 식단 영양소 정보 문자열 생성
    dietNtrsmallInfo += `열량 ${parseFloat(clriInfo)}kcal,`;
    dietNtrsmallInfo += `당질 ${parseFloat(crbhInfo)}g,`;
    dietNtrsmallInfo += `단백질 ${parseFloat(protInfo)}g,`;
    dietNtrsmallInfo += `지질 ${parseFloat(ntrfsInfo)}g`;

    try {
      // 임시 이름으로 다운받은 이미지가 있으면 이미지 파일명 변경
      if (imgFile) {
        destFileName = cntntsNo + "." + common.getExtName(imgFile.mimetype);
        await fsPromises.rename(imgFile.path, path.join(imgFile.destination, destFileName));
      }

      let diet = new Diet({
        cntntsNo,
        dietSeCode,
        dietNm,
        dietCn,
        rtnStreFileNm: destFileName,
        rtnThumbFileNm: destFileName,
        dietNtrsmallInfo,
        clriInfo,
        crbhInfo,
        protInfo,
        ntrfsInfo,
        registDt: Date.now()
      });
      
      await diet.save();

      // 생성 성공했으면 dietList 페이지 보여줌.
      req.session.message = "식단 생성 완료!";

    } catch (err) {
      console.log(err);
    }

    res.redirect("/admin/diet");
  });
}

module.exports.router = router;