const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  var cookie = req.cookies.jwt;
  if (!cookie) {
    res.json({ message: "login first" });
    console.log({ message: "login first" });
  } else {
    jwt.verify(cookie, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.log({ message: "login first" });
        res.status(400).send({ message: "login first" });
        return;
      } else {
        // res.send(user);
        // req.userId = user.id; 
        next(); 
      }
    });
  }
};

module.exports = { authenticate };