const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const Food = require("../../../models/Food");
const Diet = require("../../../models/Diet");


module.exports.config = function (common) {
  // 식단 수정 페이지
  router.get("/:cntntsNo", async (req, res) => {
    let { cntntsNo } = req.params;
    let diet;
    let notFoundError = false;

    try {
      diet = await Diet.findOne({cntntsNo});

      if (!diet) {
        diet = new Diet();
        notFoundError = true;
      }
    } catch (err) {
      console.log(err);
    }

    res.render("admin/main.ejs", {
      pageName: "dietEditor",
      sectionName: "diet",
      diet,
      notFoundError
    });
  });

  // 식단 수정 요청
  router.post("/:cntntsNo", common.upload.single("imageFile"), async (req, res) => {
    let { cntntsNo } = req.params;
    let { dietNm, clriInfo, crbhInfo, protInfo, ntrfsInfo, dietCn } = req.body;
    const imgFile = req.file;
    let diet;

    try {
      diet = await Diet.findOne({cntntsNo});
      diet.dietNm = dietNm;
      diet.clriInfo = clriInfo;
      diet.crbhInfo = crbhInfo;
      diet.protInfo = protInfo;
      diet.ntrfsInfo = ntrfsInfo;
      diet.dietCn = dietCn;

      // 식단 영양소 정보 문자열 생성
      let dietNtrsmallInfo = "";
      dietNtrsmallInfo += `열량 ${parseFloat(clriInfo)}kcal,`;
      dietNtrsmallInfo += `당질 ${parseFloat(crbhInfo)}g,`;
      dietNtrsmallInfo += `단백질 ${parseFloat(protInfo)}g,`;
      dietNtrsmallInfo += `지질 ${parseFloat(ntrfsInfo)}g`;
      diet.dietNtrsmallInfo = dietNtrsmallInfo;

      // 임시 이름으로 다운받은 이미지가 있으면 이미지 파일명 변경
      if (imgFile) {
        // 기존에 DB에 해당 음식의 이미지 파일 정보가 있었다면 제거
        let imgPath = path.join(imgFile.destination, diet.rtnStreFileNm);
        fsPromises.access(imgPath, fs.constants.F_OK).then(async () => {
          await fsPromises.rm(imgPath);
        }).catch(() => {});

        diet.rtnStreFileNm = cntntsNo + "." + common.getExtName(imgFile.mimetype);
        await fsPromises.rename(imgFile.path, path.join(imgFile.destination, diet.rtnStreFileNm));
      }

      await diet.save();

    } catch (err) {
      console.log(err);
    }

    res.redirect(`/admin/diet/detail/${cntntsNo}`);
  });
}

module.exports.router = router;