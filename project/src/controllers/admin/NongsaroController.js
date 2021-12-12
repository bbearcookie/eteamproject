const router = require("express").Router();
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const nongsaroService = require("../../services/NongsaroService");
const Diet = require("../../models/Diet");
const Food = require("../../models/Food");
const Exercise = require("../../models/Exercise");
const recommendDietListFileSrc = path.join(process.env.INIT_CWD, "public/rawData/recommendDietList.json");

// 농사로 데이터 페이지 보여줌
router.get("/", async (req, res) => {
  res.render("admin/main.ejs", {
    pageName: "nongsaro",
    sectionName: "nongsaro"
  });
});

// json 파일로 저장된 운동 데이터들을 DB에 저장함 (농사로와는 무관함)
router.post("/exerdata", async (req, res) => {
  let exerList = JSON.parse(await fsPromises.readFile(path.join(process.env.INIT_CWD, "public/csv/Exerdata.json"), "utf-8"));

  try {
    for (exer of exerList) {
      let exercise = await Exercise.findOne({ExcntntsNo: exer.ExcntntsNo});

      // 아직 DB에 해당 운동 코드의 운동이 저장 되어 있지 않은 상태에만 저장한다.
      if (!exercise) {
        let exercise = new Exercise();
        let splitedImageUrl = exer.imageLink.split("/"); // 이미지 파일의 URL을 / 를 기준으로 분리해놓음.
        exercise.ExcntntsNo = exer.ExcntntsNo;
        exercise.ExcNm = exer.ExcNm;
        exercise.ExcType = exer.ExcType;
        exercise.Excplace = exer.Excplace;
        exercise.Exccnt = exer.Exccnt;
        exercise.ExcCn = exer.ExcCn;
        exercise.HowtoExcInfo = exer.HowtoExcInfo;

        // 이미지 링크의 URL에서 가장 마지막 부분이 파일명 부분임.
        // 이미지 링크의 마지막 부분에 .jpg?type=w2 처럼 쿼리가 붙은경우 ?로 split해서 첫번째 부분만 추출해서 쿼리 부분은 버려야함.
        let fileNm = splitedImageUrl[splitedImageUrl.length - 1].split("?")[0];

        // imageLink의 마지막 부분에 확장자가 안붙어있는 경우엔 .jpg를 붙힌 값을 파일명으로 저장해야함.
        if (!fileNm.includes(".")) {
          fileNm += ".jpg"
        }
        exercise.rtnStreFileNm = fileNm;
        exercise.rtnThumbFileNm = fileNm;
        
        await exercise.save();
        await nongsaroService.downloadImage(exer.imageLink, "public/image/exercise/normal", exercise.rtnStreFileNm);
      }
    }

  } catch (err) {
    console.log(err);
  }

  res.json({message: `${exerList.length} 개의 운동 데이터 DB에 저장 완료!`});
});

// 농사로API에 있는 식단 분류 코드를 모두 가져옴.
router.get("/dietSeCode", async (req, res) => {
  let result = {};

  try {
    let dietSeCodeList = await nongsaroService.getDietSeCodeList();
    result.dietSeCodeList = dietSeCodeList;
    result.message = `조회한 식단 구분 코드는 총 ${dietSeCodeList.length} 개 입니다.`
  } catch (err) {
    result.error = err.toString();
  }

  res.json(result);
});

// 농사로 API에 있는 모든 식단 정보를 파일로 저장
router.post("/dietSeCode/:index", async (req, res) => {
  let { dietSeCodeList } = req.body;
  let { index } = req.params;
  index = parseInt(index);
  let result = {};

  // 폴더가 아직 없으면 폴더를 생성한다.
  let directory = path.parse(recommendDietListFileSrc).dir;
  await fsPromises.access(directory, fs.constants.F_OK).catch(async () => {
    try {
      await fsPromises.mkdir(directory, { recursive: true });
    } catch (err) {
      console.log(err);
    }
  });

  // 처음 처리하는거면 파일 생성
  if (index == 0) {
    await fsPromises.writeFile(recommendDietListFileSrc, "["); // json 객체를 배열로 넣을것임
  }

  try {
    await nongsaroService.downloadAllDiet(dietSeCodeList[index], recommendDietListFileSrc);

    // 마지막이면 파일 끝에 배열 닫는 표시인 ]를 써줌
    if (index + 1 == dietSeCodeList.length) {
      let fileData = await fsPromises.readFile(recommendDietListFileSrc, "utf-8");
      fileData = fileData.slice(0, -1); // 마지막 문자인 콤마를 제거
      fileData = fileData + "]" // 배열을 닫아줌
      await fsPromises.writeFile(recommendDietListFileSrc, fileData, "utf-8");
    }

    result.message = `${index + 1}. 식단 구분 코드 [${dietSeCodeList[index]}] 에 속하는 식단 정보 파일로 저장`;
  } catch (err) {
    result.error = err.toString();
    console.log(err);
  }

  res.json(result);
});

// 파일로 저장된 식단들의 갯수를 클라이언트에 전송
router.get("/diet", async (req, res) => {
  let result = {};

  try {
    let dietList = await nongsaroService.getDietList(recommendDietListFileSrc);
    result.dietList = dietList;
    result.message = `농사로 API로부터는 총 ${dietList.length} 개의 식단을 다운로드 받았습니다.`;
  } catch (err) {
    result.error = err.toString();
    console.log(err);
  }

  res.json(result);
});

// 파일로 저장한 모든 식단 정보를 하나씩 서버에 저장
router.post("/diet/:index", async (req, res) => {
  let { index } = req.params;
  index = parseInt(index);
  let result = {};

  try {
    result.message = await nongsaroService.saveDietList(index, req.body.diet);
  } catch (err) {
    result.error = err.toString();
    console.log(err);
  }

  res.json(result);
});

// DB에 저장된 식단들을 클라이언트에 전송
router.get("/dietDB", async (req, res) => {
  let result = {};

  try {
    let dietList = await Diet.find({});
    result.dietList = dietList;
  } catch (err) {
    result.error = err.toString();
    console.log(err);
  }

  res.json(result);
});

// DB에 저장된 음식들을 클라이언트에 전송
router.get("/foodDB", async (req, res) => {
  let result = {};

  try {
    let foodList = await Food.find({});
    result.foodList = foodList;
  } catch (err) {
    result.error = err.toString();
    console.log(err);
  }

  res.json(result);
});

// 식단 이미지 다운로드
router.get("/dietImage/:index", async (req, res) => {
  let { diet } = req.query;
  diet = JSON.parse(diet);
  let { index } = req.params;
  index = parseInt(index);
  let result = {};

  try {
    await nongsaroService.downloadImage("http://www.nongsaro.go.kr/cms_contents/114/" + diet.rtnStreFileNm, "public/image/diet/normal", diet.rtnStreFileNm);
    await nongsaroService.downloadImage("http://www.nongsaro.go.kr/cms_contents/114/" + diet.rtnThumbFileNm, "public/image/diet/thumbnail", diet.rtnThumbFileNm);
    result.message = `${index}. ${diet.rtnStreFileNm} 다운로드 완료`;
  } catch (err) {
    result.error = err.toString();
    console.log(err);
  }

  res.json(result);
});

// 음식 이미지 다운로드
router.get("/foodImage/:index", async (req, res) => {
  let { food } = req.query;
  food = JSON.parse(food);
  let { index } = req.params;
  index = parseInt(index);
  let result = {};

  try {
    await nongsaroService.downloadImage("http://www.nongsaro.go.kr/cms_contents/809/" + food.rtnStreFileNm, "public/image/food/normal", food.rtnStreFileNm);
    await nongsaroService.downloadImage("http://www.nongsaro.go.kr/cms_contents/809/" + food.rtnThumbFileNm, "public/image/food/thumbnail", food.rtnThumbFileNm);
    result.message = `${index}. ${food.rtnStreFileNm} 다운로드 완료`;
  } catch (err) {
    result.error = err.toString();
    console.log(err);
  }

  res.json(result);
});

// 해당 식단이 포함하는 모든 음식을 요청해서 DB에 저장
router.post("/food/:index", async (req, res) => {
  let { index } = req.params;
  index = parseInt(index);
  let result = {};

  try {
    result.message = await nongsaroService.saveFoodList(index, req.body.diet);
  } catch (err) {
    result.error = err.toString();
    console.log(err);
  }

  res.json(result);
});

// 열량 영양성분이 0인 식단을 모두 제거한다.
router.delete("/food", async (req, res) => {
  let result = {};
  try {
    await Diet.deleteMany({clriInfo: 0});
    result.message = "영양 성분이 기재되지 않은 식단 삭제 처리 완료!";
  } catch (err) {
    result.error = err.toString();
    console.log(err);
  }
  res.json(result);
});

module.exports = router;