const mongoose = require("mongoose");
const Allergy = require("../models/Allergy");

module.exports.connect = async function () {
  // 몽고 DB 연결
  await mongoose.connect(process.env.MONGO_URL);

  // 아직 DB에 기록되지 않은 알레르기 정보들 DB에 저장
  const allergyList = [
  {
    name: "게",
    strings: ["게"]
  },
  {
    name: "메밀",
    strings: ["메밀"]
  },
  {
    name: "잣",
    strings: ["잣"]
  },
  {
    name: "고등어",
    strings: ["고등어"]
  },
  {
    name: "밀",
    strings: ["밀"]
  },
  {
    name: "전복",
    strings: ["전복"]
  },
  {
    name: "굴",
    strings: ["굴"]
  },
  {
    name: "복숭아",
    strings: ["복숭아"]
  },
  {
    name: "조개",
    strings: ["조개"]
  },
  {
    name: "난류",
    strings: ["계란", "달걀", "메추리알"]
  },
  {
    name: "새우",
    strings: ["새우"]
  },
  {
    name: "참깨",
    strings: ["참깨"]
  },
  {
    name: "닭고기",
    strings: ["닭"]
  },
  {
    name: "쇠고기",
    strings: ["소고기", "쇠고기"]
  },
  {
    name: "키위",
    strings: ["키위"]
  },
  {
    name: "대두",
    strings: ["대두"]
  },
  {
    name: "아황산류 함유",
    strings: ["아황산"]
  },
  {
    name: "토마토",
    strings: ["토마토"]
  },
  {
    name: "돼지고기",
    strings: ["돼지고기"]
  },
  {
    name: "오징어",
    strings: ["오징어"]
  },
  {
    name: "호두",
    strings: ["호두"]
  },
  {
    name: "땅콩",
    strings: ["땅콩"]
  },
  {
    name: "우유",
    strings: ["우유"]
  },
  {
    name: "홍합",
    strings: ["홍합"]
  },
  ];

  for (i in allergyList) {
    try {
      let allergy = await Allergy.findOne({name: allergyList[i].name});
      if (!allergy) {
        Allergy.create(allergyList[i]);
      }
    } catch (err) {
      console.log(err);
    }
  }
}

