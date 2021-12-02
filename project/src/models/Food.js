const mongoose = require("mongoose");

// 음식에 대한 스키마
const FoodSchema = mongoose.Schema({
  fdCntntsNo: { type: Number, required: true, unique: true },  // 음식 코드
  cntntsNo: { type: Number, required: true }, // 식단 코드
  fdNm: { type: String, default: "" }, // 음식 명
  ckngMthInfo: { type: String, default: "" }, // 조리 방법
  rtnStreFileNm: { type: String, default: "" }, // 이미지 파일명
  rtnThumbFileNm: { type: String, default: "" }, // 썸네일 이미지 파일명
  matrlInfo: { type: String, default: "" }, // 재료 정보
  registDt: { type: Date } // 등록일
});

module.exports = mongoose.model("food", FoodSchema);