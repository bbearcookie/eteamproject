const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const Exercise = require("../../../models/Exercise");

module.exports.config = function (common) {
  // 운동 수정 페이지
  router.get("/:ExcntntsNo", async (req, res) => {
    let { ExcntntsNo } = req.params;
    let { previousPage } = req.query;
    let notFoundError = false;
    let exercise;

    try {
      exercise = await Exercise.findOne({ExcntntsNo});
      
      // 해당 운동을 찾을 수 없습니다라고 보여주기 위해 notFoundError
      if (!exercise) {
        exercise = new Exercise();
        notFoundError = true;
      }

    } catch (err) {
      console.log(err);
    }

    res.render("admin/main.ejs", {
      pageName: "exerciseEditor",
      sectionName: "exercise",
      title: "운동 수정",
      ExcntntsNo: exercise.ExcntntsNo,
      ExcNm: exercise.ExcNm,
      ExcCn: exercise.ExcCn,
      ExcType: exercise.ExcType,
      Excplace:exercise.Excplace,
      Excintensity:exercise.Excintensity,
      Exccnt:exercise.Exccnt,
      HowtoExcInfo: exercise.HowtoExcInfo,
      rtnStreFileNm: exercise.rtnStreFileNm,
      errorMessage: "",
      notFoundError,
      previousPage
    });
  });

  // 운동 수정 처리
  router.post("/:ExcntntsNo", common.upload.single("imageFile"), async (req, res) => {
    let { ExcntntsNo } = req.params;
    const { ExcNm, ExcCn, HowtoExcInfo, previousPage } = req.body;
    const imgFile = req.file;
    let exercise;

    try {
      exercise = await Exercise.findOne({ExcntntsNo});
      exercise.ExcNm = ExcNm;
      exercise.ExcCn = ExcCn;
      exercise.HowtoExcInfo = HowtoExcInfo;

      // 임시 이름으로 다운받은 이미지가 있으면 이미지 파일명 변경
      if (imgFile) {

        // 기존에 DB에 해당 운동의 이미지 파일 정보가 있었다면 제거
        let imgPath = path.join(imgFile.destination, exercise.rtnStreFileNm);
        fsPromises.access(imgPath, fs.constants.F_OK).then(async () => {
          await fsPromises.rm(imgPath);
        }).catch(() => {});

        exercise.rtnStreFileNm = ExcntntsNo + "." + common.getExtName(imgFile.mimetype);
        await fsPromises.rename(imgFile.path, path.join(imgFile.destination, exercise.rtnStreFileNm));
      }

      await exercise.save();


    } catch (err) {
      console.log(err);
    }
    
    res.render("admin/main.ejs", {
      pageName: "exerciseDetail",
      sectionName: "exercise",
      notFoundError: false,
      exercise,
    });
  });
}

module.exports.router = router;