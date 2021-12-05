const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const Food = require("../../models/Food");
const Diet = require("../../models/Diet");

module.exports.config = function (common) {
  // 음식 수정 페이지
  router.get("/:fdCntntsNo", async (req, res) => {
    let { fdCntntsNo } = req.params;
    let notFoundError = false;
    let food;

    try {
      food = await Food.findOne({fdCntntsNo});
      
      // 해당 음식을 찾을 수 없습니다라고 보여주기 위해 notFoundError
      if (!food) {
        food = new Food();
        notFoundError = true;
      }

    } catch (err) {
      console.log(err);
    }

    res.render("admin/main.ejs", {
      pageName: "foodEditor",
      sectionName: "food",
      title: "음식 수정",
      fdCntntsNo: food.fdCntntsNo,
      cntntsNo: food.cntntsNo,
      fdNm: food.fdNm,
      matrlInfo: food.matrlInfo,
      ckngMthInfo: food.ckngMthInfo,
      rtnStreFileNm: food.rtnStreFileNm,
      errorMessage: "",
      notFoundError,
    });
  });

  // 음식 수정 처리
  router.post("/:fdCntntsNo", common.upload.single("imageFile"), async (req, res) => {
    let { fdCntntsNo } = req.params;
    let { fdNm, matrlInfo, ckngMthInfo } = req.body;
    const imgFile = req.file;
    let food;

    try {
      food = await Food.findOne({fdCntntsNo});
      food.fdNm = fdNm;
      food.matrlInfo = matrlInfo;
      food.ckngMthInfo = ckngMthInfo;

      // 임시 이름으로 다운받은 이미지가 있으면 이미지 파일명 변경
      if (imgFile) {

        // 기존에 DB에 해당 음식의 이미지 파일 정보가 있었다면 제거
        let imgPath = path.join(imgFile.destination, food.rtnStreFileNm);
        fsPromises.access(imgPath, fs.constants.F_OK).then(async () => {
          await fsPromises.rm(imgPath);
        }).catch(() => {});

        food.rtnStreFileNm = fdCntntsNo + "." + common.getExtName(imgFile.mimetype);
        await fsPromises.rename(imgFile.path, path.join(imgFile.destination, food.rtnStreFileNm));
      }

      await food.save();


    } catch (err) {
      console.log(err);
    }

    res.render("admin/main.ejs", {
      pageName: "foodDetail",
      sectionName: "food",
      notFoundError: false,
      food,
    });
  });
}

module.exports.router = router;