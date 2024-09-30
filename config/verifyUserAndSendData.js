const jwt = require("jsonwebtoken");

const authenticateUserAndSendData = async (req, res, next) => {
  var cookie = req.cookies.jwt_user;
  if (!cookie) {
    res.json({ message: "login again" });
    console.log({ message: "login again" });
  } else {
    jwt.verify(cookie, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.log({ message: "login first" });
        res.status(400).send({ message: "login first" });
        return;
      } else {
        // console.log(user)
        res.send(user);
      }
    });
  }
};
module.exports = { authenticateUserAndSendData };