const database = require("../config/database");

// Get all users 
exports.getAllusers = async (req, res, next) => {
  try {
    const query = "SELECT * FROM all_users";
    database.query(query, (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
        res.send({ message: "no users" });
        console.log("no users");
      } else {
        res.send(result);
      }
    });
  } catch (err) { 
    console.log(err);
  }
};

// Get a specific buyer by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM users WHERE id=?";
    database.query(query, [id], (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
        res.send({ message: "no user with that id" });
      } else {
        res.json(result);
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update a user
exports.updateUser = async (req, res, next) => {
  const { email } = req.params;
  const { subscription_status } = req.body;
  try {
    console.log(email)
    var query = `UPDATE users SET subscription_status = '${subscription_status}' WHERE id = '${id}';`;
    database.query(query, (err, result) => {
      if (err) throw err;
      res.status(200).json({ message: "data updated" });
    });
  } catch (err) {
    next(err);
  }
};


//delete buyer
exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    var deleteQuery = `DELETE FROM users WHERE id = '${id}'`;
    database.query(deleteQuery, (err, result) => {
      if (err) {
        console.error(err); // Log the error to the console
        res.status(500).send({ message: "An error occurred" });
      } else {
        console.log(result);
        res.send({ message: "deleted" });
      }
    });
  } catch (err) {
    next(err);
  }
};