const mongoose = require("mongoose");

// 알레르기 정보 스키마
const AllergySchema = mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 알레르기 성분 이름. 마이페이지-알레르기 유발 정보에 이 이름을 가지고 checkbox를 생성할 것이다.
  strings: { type: Array }, // 해당 알레르기 성분이라고 간주할 문자열 목록. 예를 들어 계란,달걀,메추리알 등의 문자열은 난류라고 간주한다.
}, { timestamp: true });

module.exports = mongoose.model("allergy", AllergySchema);