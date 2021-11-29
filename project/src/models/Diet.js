const mongoose = require("mongoose");

// 식단에 대한 스키마. 한 식단에는 여러 개의 음식이 포함될 수 있다.
const DietSchema = mongoose.Schema({
  cntntsNo: { type: Number, required: true, unique: true }, // 식단 코드
  dietSeCode: { type: Number, required: true }, // 식단 구분코드
  dietNm: { type: String, default: "" }, // 식단 명
  dietCn: { type: String, default: "" }, // 식단 상세 설명
  rtnStreFileNm: { type: String, default: "" }, // 이미지 파일명
  rtnThumbFileNm: { type: String, default: "" }, // 썸네일 이미지 파일명
  dietNtrsmallInfo: { type: String, default: "" }, // 식단 영양소 정보
  clriInfo: { type: Number, default: 0 }, // 열량 정보
  crbhInfo: { type: Number, default: 0 }, // 당질 정보
  protInfo: { type: Number, default: 0 }, // 단백질 정보
  ntrfsInfo: { type: Number, default: 0 }, // 지질 정보
  registDt: { type: Date }, // 등록일
});

module.exports = mongoose.model("diet", DietSchema);