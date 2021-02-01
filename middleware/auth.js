const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    res.status(401).json({ msg: "Authorisation Unsuccessful" });
  }

  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(401).json({ msg: "Authorisation Unsuccessful" });
  }
};
