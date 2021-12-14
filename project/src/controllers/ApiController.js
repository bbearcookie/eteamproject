const router = require("express").Router();

// 챗봇에서 노드 서버에 연결 되는지 테스트중
router.get("/hello", async (req, res) => {
  res.json({message: "say hello!"});
});


module.exports = router;