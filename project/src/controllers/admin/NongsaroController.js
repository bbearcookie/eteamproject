const router = require("express").Router();
const fsPromises = require("fs").promises;
const path = require("path");

const nongsaroService = require("../../services/NongsaroService");
const Diet = require("../../models/Diet");
const Food = require("../../models/Food");
const recommendDietListFileSrc = path.join(process.env.INIT_CWD, "public/rawData/recommendDietList.json");

// 농사로 데이터 페이지 보여줌
router.get("/", async (req, res) => {
  res.render("admin/main.ejs", {
    pageName: "nongsaro",
    sectionName: "nongsaro"
  });
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
    await nongsaroService.downloadImage("http://www.nongsaro.go.kr/cms_contents/114/89326_MF_ATTACH_01_TMB.jpg", "public/image/diet/normal", diet.rtnStreFileNm);
    await nongsaroService.downloadImage("http://www.nongsaro.go.kr/cms_contents/114/89326_MF_ATTACH_01_TMB.jpg", "public/image/diet/thumbnail", diet.rtnThumbFileNm);
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
    await nongsaroService.downloadImage("http://www.nongsaro.go.kr/cms_contents/809/49494_MF_ATTACH_01.jpg", "public/image/food/normal", food.rtnStreFileNm);
    await nongsaroService.downloadImage("http://www.nongsaro.go.kr/cms_contents/809/49494_MF_ATTACH_01.jpg", "public/image/food/thumbnail", food.rtnThumbFileNm);
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