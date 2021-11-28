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
* /api/nongsaro/recomendDietDtl: 음식 데이터 파싱후 DB에 저장
* /api/nongsaro/dietNtrsmallInfo/empty: 영양성분 기재되지 않은 데이터들 제거
* /api/nongsaro/dietNtrsmallInfo: 원래는 음식 데이터에만 기록되어있는 영양성분 정보를 식단 데이터에도 기록
* 를 위에서 아래로 차례대로 진행하면
* 데이터들이 서버가 이용할 수 있는 형태로 가공된다.
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

// 영양 성분을 전혀 파악할 수 없는 음식이 DB에 들어있다면 그 음식이 포함된 식단과 음식을 DB에서 제거한다.
router.get("/dietNtrsmallInfo/empty", async (req, res) => {
  let foodList = await Food.find({});

  for (food of foodList) {

    if (food.dietNtrsmallInfo === "") {
      try {

        // 식단 제거
        let diet = await Diet.exists({cntntsNo: food.cntntsNo});
        if (diet) {
          console.log(`${diet.cntntsNo} 식단 삭제`);
          await Diet.deleteOne({cntntsNo: food.cntntsNo});
        }

        // 음식 제거
        console.log(`${food.fdCntntsNo} 음식 삭제`);
        await Food.deleteOne({fdCntntsNo: food.fdCntntsNo});
      } catch (err) {
        console.log(err);
      }
    }
  }

  res.send("처리 완료!");
});

// 농사로API에 음식 정보를 요청하면 얻게되는 영양성분들을 식단 DB에도 저장한다.
router.get("/dietNtrsmallInfo", async (req, res) => {
  let foodList = await Food.find({});

  for (food of foodList) {
    try {
      console.log(`${food.fdCntntsNo} 음식 처리중`);
      let diet = await Diet.findOne({cntntsNo: food.cntntsNo});
      let nutritions = food.dietNtrsmallInfo.replace(/ /g,"").split(",");
  
      // 영양성분이 원래 콤마로 구분되어야 하는데 당질127g단백질50g 이렇게 되어있는 데이터가 있어서 직접 분리해줌.
      if (nutritions.length == 3) {
        let targetStr = nutritions[1].replace("g", "g,").split(",");
  
        nutritions.splice(1, 1);
        nutritions.push(targetStr[0]);
        nutritions.push(targetStr[1]);
      }
  
      for (nutr of nutritions) {
        let value = nutr.replace(/[^0-9]/g, ''); // 숫자만 추출
  
        // 지질-g 처럼 숫자가 추출 불가능한 형태인 데이터가 있으면 그 영양성분의 값은 0으로 설정함
        if (value.length === 0) {
          value = 0;
        }
  
        // 추출한 영양성분의 값을 입력
        if (nutr.includes("열량")) {
          diet.clriInfo = value;
        } else if (nutr.includes("당질")) {
          diet.crbhInfo = value;
        } else if (nutr.includes("단백질")) {
          diet.protInfo = value;
        } else if (nutr.includes("지질")) {
          diet.ntrfsInfo = value;
        }

        // 식단 영양소 정보를 입력
        diet.dietNtrsmallInfo = food.dietNtrsmallInfo;

        await diet.save();
      }
    } catch (err) {
      console.log(err);
    }

  }

  res.send("처리 완료!");
});

module.exports = router;