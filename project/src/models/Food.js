const mongoose = require("mongoose");

// 음식에 대한 스키마
const FoodSchema = mongoose.Schema({
  fdCntntsNo: { type: Number, required: true },  // 음식 코드
  cntntsSj: { type: String, default: "" }, // 음식 이름
  fdNm: { type: String, default: "" }, // 음식 명
  fdInfo: { type: String, default: "" }, // 식단에 포함되는 음식의 코드들
  fdInfoFirst: { type: String, default: "" }, // 식단에 포함되는 음식중 가장 처음으로 오는 음식의 코드
  cntntsNo: { type: String }, // 식단 코드
  dietNm: { type: String, default: "" }, // 식단 명
  dietDtlNm: { type: String, default: "" }, // 식단 상세명
  ckngMthInfo: { type: String, default: "" }, // 조리 방법 정보
  rtnImageDc: { type: String, default: "" }, // 농사로 API가 제공하는 이미지 파일경로
  rtnStreFileNm: { type: String, default: "" }, // 이미지 파일명
  rtnThumbFileNm: { type: String, default: "" }, // 썸네일 이미지 파일명
  dietCn: { type: String, default: "" }, // 식단 내용
  matrlInfo: { type: String, default: "" }, // 재료 정보
  dietNtrsmallInfo: { type: String, default: "" }, // 식단 영양소 정보
  chlsInfo: { type: Number, default: 0 }, // 콜레스테롤 정보 
  clciInfo: { type: Number, default: 0 }, // 칼슘 정보
  clriInfo: { type: Number, default: 0 }, // 칼로리 정보
  crbhInfo: { type: Number, default: 0 }, // 당질 정보
  crfbInfo: { type: Number, default: 0 }, // 조섬요 정보
  frmlasaltEqvlntqyInfo: { type: Number, default: 0 }, // 식염 상당량 정보
  ircnInfo: { type: Number, default: 0 }, // 철분 정보
  naInfo: { type: Number, default: 0 }, // 나트륨 정보
  ntkQyInfo: { type: Number, default: 0 }, // 섭취량 정보
  ntrfsInfo: { type: Number, default: 0 }, // 지질 정보
  protInfo: { type: Number, default: 0 }, // 단백질 정보
  vtmaInfo: { type: Number, default: 0 }, // 비타민A 정보
  vtmbInfo: { type: Number, default: 0 }, // 비타민B 정보
  vtmcInfo: { type: Number, default: 0 }, // 비타민C 정보
  registDt: { type: Date } // 등록일
});

module.exports = mongoose.model("food", FoodSchema);