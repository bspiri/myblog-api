const jwt = require("jsonwebtoken");
const config = require('./config');

function authRequired(req, res, next) {
  // client sends back the token in header
  const authToken = req.headers["authorization"];
  let userData;
  try {
    userData = jwt.verify(authToken, config.JWT_secret);
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false });
  }
  next();
}

module.exports = authRequired;
