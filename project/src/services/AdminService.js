const User = require("../models/User");

// 관리자인지 아닌지 확인
module.exports.isAdmin = function (user) {
  if (!user || user.role !== "role_admin") {
    return false;
  }

  return true;
}