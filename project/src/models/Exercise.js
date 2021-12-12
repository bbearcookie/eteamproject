const mongoose = require("mongoose");

// 운동에 대한 스키마.
const ExerciseSchema = mongoose.Schema({
  ExcntntsNo: { type: Number, required: true, unique: true }, // 운동 코드
  ExcNm: { type: String, default: "" }, // 운동 명
  ExcCn: { type: String, default: "" }, // 운동 상세 설명
  rtnStreFileNm: { type: String, default: "" }, // 이미지 파일명
  rtnThumbFileNm: { type: String, default: "" }, // 썸네일 이미지 파일명
  ExcType: { type: String, default: "" }, // 운동 분류
  Excplace: { type: String, default: "" }, // 장소
  Excintensity: { type: String, default: "" }, // 강도
  Exccnt: { type: String, default: "" }, // 인원
  HowtoExcInfo: { type: String, default: "" }, // 운동방법 유튜브 링크 정보
  registDt: { type: Date }, // 등록일
});

module.exports = mongoose.model("exercise", ExerciseSchema);