const axios = require("axios");
const fsPromises = require("fs").promises;
const fs = require("fs");
const path = require("path");
const convert = require("xml-js");

const Diet = require("../models/Diet");
const Food = require("../models/Food");

/*
* 이 파일은
* 농사로 API가 제공해주는 식단과 음식 정보를
* 서버의 로컬 DB에 저장하기 위해서
* 농사로에 요청하여 받아온 XML 파일 형태를
* JSON 형식으로 변환하고,
* 사용할 가치가 있는 속성들만 뽑아서
* DB에 저장하는 로직을 담은 파일이다!
*/

// 농사로 API가 제공하는 모든 식단 분류 코드를 가져와 반환함.
module.exports.getDietSeCodeList = async function () {
  let result = [];

  try {
    const res = await axios({
      url: `http://api.nongsaro.go.kr/service/recomendDiet/mainCategoryList?apiKey=${process.env.NONGSARO_API_KEY}`,
      method: "GET"});
  
    let parsedData = convert.xml2js(res.data, { compact: true, spaces: 4 });
    let categoryList = parsedData.response.body.items.item;
  
    for (category of categoryList) {
      result.push(category.dietSeCode["_cdata"]);
    }
  } catch (err) {
    throw new Error(err);
  }

  return result;
}


// 농사로API에 있는 dietSeCode카테고리의 식단 정보를 파일로 저장
module.exports.downloadAllDiet = async function (dietSeCode, fileSrc) {
  try {
    // 구분코드가 몇 개의 식단을 가지고 있는지 확인
    async function getTotalCount() {
      const res = await axios({
        url: `http://api.nongsaro.go.kr/service/recomendDiet/recomendDietList?apiKey=${process.env.NONGSARO_API_KEY}&dietSeCode=${dietSeCode}&numOfRows=0`,
        method: "GET"});
      
      let parsedData = convert.xml2js(res.data, { compact: true, spaces: 4 });
      return parsedData.response.body.items.totalCount["_text"];
    }

    // 식단 데이터 요청
    let totalCount = await getTotalCount();
    const res = await axios({
      url: `http://api.nongsaro.go.kr/service/recomendDiet/recomendDietList?apiKey=${process.env.NONGSARO_API_KEY}&dietSeCode=${dietSeCode}&numOfRows=${totalCount}`,
      method: "GET"});

    let parsedData = convert.xml2js(res.data, { compact: true, spaces: 4 });
    
    await fsPromises.appendFile(fileSrc, JSON.stringify(parsedData) + ",", "utf-8");

  } catch (err) {
    throw new Error(err);
  }

}

// 파일로 저장해둔 모든 식단들의 정보를 반환
module.exports.getDietList = async function (fileSrc) {
  let resultDietList = [];

  try {
    let data = await fsPromises.readFile(fileSrc, "utf-8");
    let everyDietList = await JSON.parse(data);

    // 식단 코드마다 순회
    for (dietList of everyDietList) {
      let dietSeCode = parseInt(dietList.response.header.requestParameter.dietSeCode["_text"]);
      dietList = dietList.response.body.items.item;

      // 식단마다 순회
      for (diet of dietList) {
        let result = {};

        result.dietSeCode = dietSeCode; // 식단 구분코드(카테고리)
        result.cntntsNo = parseInt(diet.cntntsNo["_cdata"]); // 식단 코드
        result.dietNm = diet.dietNm["_cdata"]; // 식단 명
        result.fdNm = diet.fdNm["_cdata"]; // 음식 명
        result.rtnImageDc = diet.rtnImageDc["_cdata"]; // 농사로 API가 제공하는 이미지 파일경로
        result.rtnStreFileNm = diet.rtnStreFileNm["_cdata"]; // 이미지 파일명
        result.rtnThumbFileNm = diet.rtnThumbFileNm["_cdata"]; // 썸네일 이미지 파일명
        result.registDt = diet.registDt["_cdata"]; // 등록일
        resultDietList.push(result);
      }

    }
  } catch (err) {
    throw new Error(err);
  }

  return resultDietList;
}

// 식단 정보 중 쓸만한 값만 추출후 DB에 저장
module.exports.saveDietList = async function (index, dietData) {
  let message = "";

  // DB에 해당 식단이 아직 없다면 DB에 저장
  try {
    let diet = await Diet.exists({cntntsNo: parseInt(dietData.cntntsNo)});
    if (!diet) {
      let diet = new Diet({
        cntntsNo: dietData.cntntsNo,
        dietSeCode: dietData.dietSeCode,
        dietNm: dietData.dietNm,
        rtnStreFileNm: dietData.rtnStreFileNm,
        rtnThumbFileNm: dietData.rtnThumbFileNm,
        registDt: dietData.registDt
      });
      await diet.save();
      message = `${index + 1}. ${dietData.cntntsNo}(${dietData.dietNm})가 DB에 저장되었습니다.`;
    } else {
      message = `${index + 1}. ${dietData.cntntsNo}(${dietData.dietNm})은 이미 DB에 있습니다.`;
    }
  } catch (err) {
    throw new Error(err);
  }

  return message;
}

// 식단이 포함하는 모든 음식을 요청해서 DB에 저장
module.exports.saveFoodList = async function (index, dietData) {
  let message = `${index + 1}. `;

  // DB에 해당 식단이 포함하는 음식이 아직 없다면 저장
  try {
    const res = await axios({
      url: `http://api.nongsaro.go.kr/service/recomendDiet/recomendDietDtl?apiKey=${process.env.NONGSARO_API_KEY}&cntntsNo=${dietData.cntntsNo}`,
      method: "GET"});

    let parsedData = convert.xml2js(res.data, { compact: true, spaces: 4 });
    let foodList = parsedData.response.body.items.item;

    if (foodList) {
      // 데이터가 여러개인 경우
      if (foodList.length) {
        for (food of foodList) {
          message = await parseFood(food);
        }
      // 데이터가 하나인 경우
      } else {
        message = await parseFood(foodList);
      }
    }

  } catch (err) {
    throw new Error(err);
  }

  async function parseFood(food) {
    let message = "";

    try {
      // 파싱한 정보들을 json 객체로 생성함.
      let result = {};
      result.fdCntntsNo = food.fdCntntsNo["_cdata"]; // 음식 코드
      result.cntntsSj = food.cntntsSj["_cdata"]; // 음식 이름
      result.fdNm = food.fdNm["_cdata"]; // 음식 명
      result.fdInfo = food.fdInfo["_cdata"]; // 식단에 포함되는 음식의 코드들
      result.fdInfoFirst = food.fdInfoFirst["_cdata"]; // 식단에 포함되는 음식중 가장 처음으로 오는 음식의 코드
      result.cntntsNo = food.cntntsNo["_cdata"]; // 식단 코드
      result.dietNm = food.dietNm["_cdata"]; // 식단 명
      result.dietDtlNm = food.dietDtlNm["_cdata"]; // 식단 상세명
      result.ckngMthInfo = food.ckngMthInfo["_cdata"]; // 조리 방법 정보
      result.rtnImageDc = food.rtnImageDc["_cdata"]; // 농사로 API가 제공하는 이미지 파일경로
      result.rtnStreFileNm = food.rtnStreFileNm["_cdata"]; // 이미지 파일명
      result.rtnThumbFileNm = food.rtnThumbFileNm["_cdata"]; // 썸네일 이미지 파일명
      result.dietCn = food.dietCn["_cdata"]; // 식단 내용
      result.matrlInfo = food.matrlInfo["_cdata"]; // 재료 정보
      result.dietNtrsmallInfo = food.dietNtrsmallInfo["_cdata"]; // 식단 영양소 정보
      result.registDt = food.registDt["_cdata"]; // 등록일

      // 영양소 정보가 있는 데이터만 DB에 저장한다.
      // 만약 데이터가 없는 음식이 있다면 그 음식을 포함하는 식단도 DB에서 제거한다.
      if (result.dietNtrsmallInfo) {
    
        // DB에 해당 음식이 아직 없다면 DB에 저장 ==================================================
        food = await Food.exists({fdCntntsNo: result.fdCntntsNo});
        if (!food) {
          let food = new Food({
            fdCntntsNo: result.fdCntntsNo,
            cntntsNo: result.cntntsNo,
            fdNm: result.fdNm,
            ckngMthInfo: result.ckngMthInfo,
            rtnStreFileNm: result.rtnStreFileNm,
            rtnThumbFileNm: result.rtnThumbFileNm,
            matrlInfo: result.matrlInfo,
            registDt: result.registDt
          });
          await food.save();
        }

        // 음식에 기록되어있는 정보들을 가지고 필요한 데이터를 식단 DB에 저장 ==================================================
        let diet = await Diet.findOne({cntntsNo: result.cntntsNo});
        let nutritions = result.dietNtrsmallInfo.replace(/ /g,"").split(",");
    
        // 영양성분이 원래 콤마로 구분되어야 하는데 당질127g단백질50g 이렇게 되어있는 데이터가 있어서 직접 분리해줌.
        if (nutritions.length == 3) {
          let targetStr = nutritions[1].replace("g", "g,").split(",");
    
          nutritions.splice(1, 1);
          nutritions.push(targetStr[0]);
          nutritions.push(targetStr[1]);
        }
    
        // 영양소 정보 문자열에서 영양 성분마다 파싱해서 값 추출하여 저장
        for (nutr of nutritions) {
          let value = nutr.replace(/[^0-9]/g, ''); // 숫자만 추출
    
          // 지질-g 처럼 숫자가 추출 불가능한 형태인 데이터가 있으면 그 영양성분의 값은 0으로 설정함
          if (value.length === 0) {
            value = 0;
          }
    
          // 추출한 영양성분의 값을 저장
          if (nutr.includes("열량")) {
            diet.clriInfo = value;
          } else if (nutr.includes("당질")) {
            diet.crbhInfo = value;
          } else if (nutr.includes("단백질")) {
            diet.protInfo = value;
          } else if (nutr.includes("지질")) {
            diet.ntrfsInfo = value;
          }
        }

        // 식단 상세 정보 저장
        diet.dietCn = result.dietCn;

        // 식단 영양소 정보 저장
        diet.dietNtrsmallInfo = result.dietNtrsmallInfo;

        await diet.save();
        return `${index + 1}. ${result.cntntsNo}(${result.dietNm}) 식단 처리 완료`;
      // 음식에 영양소 정보가 없다면 해당 음식이 포함된 식단 DB에서 제거
      } else {
        let diet = await Diet.exists({cntntsNo: result.cntntsNo});
        if (diet) {
          await Diet.deleteOne({cntntsNo: result.cntntsNo});
          return `${index + 1}. ${result.cntntsNo}(${result.dietNm}) 식단 삭제`;
        }
        return `${index + 1}. ${result.cntntsNo}(${result.dietNm}) 식단 처리 완료!`;
      }
  
    } catch (err) {
      throw new Error(err);
    }
  }

  return message;
}

// url로부터 이미지 파일을 가져와서 directory 경로의 filename 으로 저장하는 함수 (식단과 음식의 이미지)
module.exports.downloadImage = async function (url, directory, filename) {
  
  // 이미지 파일 정보가 존재할 경우에만 다운로드한다.
  if (filename) {
    // let splitedUrl = url.split("/");
    // let imgPath;
    // splitedUrl[splitedUrl.length - 1] = filename;
    let destPath = path.join(process.env.INIT_CWD, directory, filename);
    
    // 폴더가 아직 없으면 폴더를 생성한다.
    await fsPromises.access(directory, fs.constants.F_OK).catch(async () => {
      try {
        await fsPromises.mkdir(directory, { recursive: true });
      } catch (err) {
        console.log(err);
      }
    });
  
    // 이미지 파일이 아직 없으면 다운로드한다.
    await fsPromises.access(destPath, fs.constants.F_OK).catch(async () => {
      const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream'
      });
  
      return new Promise((resolve, reject) => {
          response.data.pipe(fs.createWriteStream(destPath))
              .on('error', reject)
              .once('close', () => resolve(destPath)); 
      });
    });
  }
};