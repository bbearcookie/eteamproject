const router = require("express").Router();
const nongsaroService = require("../services/NongsaroService");
const Diet = require("../models/Diet");
const Food = require("../models/Food");

/*
* 이 파일은
* 농사로 API가 제공해주는 식단과 음식 정보를
* 서버의 로컬 DB에 저장하고
* 영양성분이 기재되지 않은 일부 데이터를 삭제하고
* 각 음식에만 기재되어 있던 영양성분을 식단 데이터에도 기재해주는 기능을
* 라우팅 형태로 제공하기 위한 컨트롤러 파일이다!
*
* 순차적으로 
* /api/nongsaro/recommendDietList: 식단 데이터 파싱후 DB에 저장
* /api/nongsaro/recomendDietDtl: 음식 데이터 파싱후 DB에 저장. 그 과정에서 영양성분 기재되지 않은 데이터들은 제거.
* 를 차례대로 진행하면
* 데이터들이 서버가 이용할 수 있는 형태로 가공되어 DB에 저장된다.
*/

// 농사로 API의 recommendDietList가 제공하는 식단 목록 데이터를 파싱해서 DB에 저장한다.
router.get("/recommendDietList", async (req, res) => {
  console.log("GET /api/nongsaro/recommendDietList");

  await nongsaroService.recommendDietList("254001"); // 수능점수 Up 특별식단
  await nongsaroService.recommendDietList("254002"); // 美와건강 다이어트 식단
  await nongsaroService.recommendDietList("254003"); // 행복한 가정을위한 식단
  await nongsaroService.recommendDietList("254004"); // 특별한 날 이벤트
  await nongsaroService.recommendDietList("254005"); // 기분이 좋아지는 식단

  res.send("처리 완료!");
});

// 농사로 API의 recomendDietDtl가 제공하는 음식 상세 정보 데이터를 파싱해서 DB에 저장한다.
router.get("/recomendDietDtl", async (req, res) => {
  console.log("GET /api/nongsaro/recomendDietDtl");

  let dietList = await Diet.find({});

  for (diet of dietList) {
    await nongsaroService.recomendDietDtl(diet.cntntsNo);
  }

  res.send("처리 완료!");
});

// DB에 저장된 모든 음식의 이미지를 다운로드
router.get("/recomendDietDtl/image", async (req, res) => {
  let foodList = await Food.find({});

  for (food of foodList) {
    // 이미지 다운로드
    let url = "http://www.nongsaro.go.kr/cms_contents/809/filename";
    let directory = "public/image/food/normal";
    let filename = food.rtnStreFileNm;
    await nongsaroService.downloadImage(url, directory, filename);
    
    // 썸네일 이미지 다운로드
    directory = "public/image/food/thumbnail";
    filename = food.rtnThumbFileNm;
    await nongsaroService.downloadImage(url, directory, filename);
  }

  res.send("처리 완료");
});

// 특정 음식의 이미지를 다운로드
router.get("/recomendDietDtl/image/:fdCntntsNo", async (req, res) => {
  let { fdCntntsNo } = req.params;

  // 이미지 다운로드
  let url = "http://www.nongsaro.go.kr/cms_contents/809/filename";
  let directory = "public/image/food/normal";
  let filename = `${fdCntntsNo}_MF_ATTACH_01.jpg`;
  await nongsaroService.downloadImage(url, directory, filename);
  
  // 썸네일 이미지 다운로드
  directory = "public/image/food/thumbnail";
  filename = `${fdCntntsNo}_MF_ATTACH_01_TMB.jpg`;
  await nongsaroService.downloadImage(url, directory, filename);

  res.send("처리 완료");
});

module.exports = router;