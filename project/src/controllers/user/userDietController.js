const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const Diet = require("../../../models/Diet");


/* 사용자가 마이페이지에서 연결되는 각 내 식단/내 운동에서(마이페이지-내식단보기/내운동보기)
* 내 식단 및 내 운동을 조회하고/삭제하고/전체초기화(전체삭제)하는 기능을 포함한다.
* 리스트에 식단코드(내운동 의 경우 운동코드)를 저장하고?.//이부분은 추천기능의 몫이... 아님 추천에서 사용자가 '내식단에 저장'
* 기능을 이용하면->내 식단에 저장되어있어야함. 추천기능은 식단코드만 전송해주고, 리스트는 여기서 구현
* 사용자가 내 식단 페이지를 확인하면 식단코드를 이용해 썸네일, 식단명, 식단 상세설명, 식단 영양소 정보, 열량 당질 단백질 지질
* 제공
* '추천식단'의 내식단에추가 기능과 연결 필요?
*/


//추천기능에서 보내는 식단코드 받아오는 함수
function getDiet(cntntsNo)  //맞춰보고
{

}


// 마이페이지-'내 식단'에서 내식단 조회하기
router.get("/", async (req, res) => {
    //res.render("admin/main.ejs", {
    //  pageName: "mainContent",
    //  sectionName: "main"
    //});
  });

  // 식단 생성 페이지
const dietWriterController = require("./DietWriterController");
dietWriterController.config(common);
router.use("/writer", dietWriterController.router);