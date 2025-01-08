const jwt = require("jsonwebtoken");
const database = require("../database");

const authenticateUserAndSendData = async (req, res, next) => {
  const cookie = req.cookies.client_side_chat;

  // Check if the cookie is present
  if (!cookie) {
    const message = "Please log in again.";
    console.log({ message });
    return res.status(401).json({ message });
  }

  // Verify the JWT
  jwt.verify(cookie, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      const message = "Please log in first.";
      console.log({ message });
      return res.status(401).json({ message });
    }

    const { id } = user;
    const query = "SELECT * FROM users WHERE id=?";
    
    database.query(query, [id], (err, result) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      
      if (result.length === 0) {
        return res.status(404).json({ message: "No user found with that ID." });
      }

      // Respond with user data
      res.json(result[0]); // Assuming you want to return a single user object
    });
  });
};

module.exports = { authenticateUserAndSendData };
