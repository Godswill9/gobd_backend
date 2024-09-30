const database = require("../database");
const { v4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

//signup
//signup
const signup = async (req, res, next) => {
  if (!req.body) {
    console.log("no body");
    return;
  }

  var userId = v4();
  var codeId = v4();
  console.log(req.body);
  var date = new Date();
  
  var {
    username,
    email,
    password,
    phoneNumber,
    car_make,
    car_model,
    car_year,
    engine_type,
    code,
  } = req.body;

  if (!username || !email || !password || !phoneNumber) {
    console.log("fill in all details");
    res.json({ message: "fill in all details" });
    return;
  } else {
    if (password.length < 7) {
      res.json({ message: "password must be greater than 7 chars" });
      return;
    }

    var salt = await bcrypt.genSalt(10);
    if (!salt) {
      console.log("Error generating salt");
      return;
    }

    var hashed;
    try {
      hashed = await bcrypt.hash(password, salt);
    } catch (err) {
      console.log("Error hashing password:", err);
      return;
    }

    var check = "SELECT * FROM users WHERE email = ?";
    database.query(check, [email], (err, result) => {
      if (result.length !== 0) {
        console.log("user has registered with us");
        res.json({ message: "user already exists", redirect: "true" });
        return;
      } else {
        var createUser = `INSERT INTO users (
          id,
          username,
          email,
          password,
          phone,
          car_make,
          car_model,
          car_year,
          engine_type,
          created_at,
          updated_at
        ) VALUES ?`;
        
        var values = [
          [
            userId,
            username,
            email,
            hashed,
            phoneNumber,
            car_make,
            car_model,
            car_year,
            engine_type,
            date,
            date,
          ],
        ];
        
        database.query(createUser, [values], (err, result) => {
          if (err) throw err;
          console.log(result);
          res.send({ message: "user registered", status: "success" });
        });

        // Code generation and storage
        var createCode = `INSERT INTO reg_code (
          id,
          code,
          status,
          userId,
          email
        ) VALUES ?`;
        
        var val = [[codeId, code, "NOT-USED", userId, email]];
        database.query(createCode, [val], (err, result) => {
          if (err) throw err;
          console.log(result);
        });

        // Send code mail
        let transporter = nodemailer.createTransport({
          host: "localhost",
          service: "gmail",
          port: 3010,
          secure: false,
          auth: {
            user: "guche9@gmail.com",
            pass: "pgthdihimvbxvmyc",
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        // Sending the auth mail
        let info = transporter.sendMail({
          from: '"Uchechukwu" <guche9@gmail.com>',
          to: `${email}`,
          subject: "Welcome new user!",
          html: `
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" width="600" style="margin: 0 auto;">
            <tr>
              <td style="padding: 20px 0; text-align: center; background-color: blue;">
                <h1 style="color: #fff;">User signup</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <div style="background-color: #fff; padding: 20px;">
                  <h2 style="color: #333;">Thanks for signing up!</h2>
                  <p style="color: #333;">Here's your verification code. <b>${code}</b></p>
                  <p style="color: #333;">You will require it in the login process</p>
                  <h3 style="color: #333;">Company Details:</h3>
                  <p style="color: #333;">Asoro Automotive<br>62 Old Benin Agbor Rd<br>Benin City – Nigeria.<br>Phone: +234-810-596-3081<br>Email: support@asoroautomotive.com</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; text-align: center; background-color: #333; color: #fff;">
                &copy; 2023 Asoro Automotive
              </td>
            </tr>
          </table>
        </body>
          `,
        });
      }
    });
  }
};


//login
const login = async (req, res, next) => {
  var { email, password } = req.body;
  // console.log(req.body);
  var checkForUser = "SELECT * FROM users WHERE email = ?";
  database.query(checkForUser, [email], async (err, result) => {
    console.log(result);
    if (!result || result.length === 0) {
      console.log("user not found");
      res.json({ message: "user not found" });
    } else {
      //check if verified
      var checkForUserEmail =
        "SELECT * FROM reg_code WHERE email = ? AND status = ?";
      database.query(
        checkForUserEmail,
        [email, "USED"],
        async (err, resultCode) => {
          if (resultCode.length == 0) {
            console.log("user not verified");
            res.json({ message: "user not verified" });
          } else {
            console.log(result[0].password);
            var queryUpdate = `UPDATE reg_code SET userId = '${result[0].id}' WHERE email = '${email}';`;
            database.query(queryUpdate, (err, result) => {
              if (err) throw err;
            });
            await bcrypt
              .compare(password, result[0].password)
              .then((resultt) => {
                if (!resultt) {
                  console.log("incorrect password");
                  res.json({ message: "incorrect password" });
                } else {
                  const accessToken = jwt.sign(
                    {
                      email: result[0].email,
                      id: result[0].id,
                      subscription_status: result[0].subscription_status,
                      car_make:result[0].car_make, 
                      car_model:result[0].car_model, 
                      car_year:result[0].car_year, 
                      engine_type:result[0].engine_type,
                      username: result[0].username,
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: "10d" }
                  );
                  res.cookie("jwt_user", accessToken, {
                    maxAge: 3600 * 1000 * 24 * 365 * 100,
                    withCredentials: true,
                    httpOnly: true,
                  });
                  const allObj = {
                    ...result[0],
                    status: "success",
                    redirect: "true",
                  };
                  res.json(allObj);
                }
              });
          }
        }
      );
    }
  });
};

//verify code
const verifyCode = async (req, res, next) => {
  var { code } = req.body;
  // console.log(req.body);
  var checkForCode = "SELECT * FROM reg_code WHERE code = ?";
  database.query(checkForCode, [code], async (err, result) => {
    if (result.length == 0) {
      console.log("incorrect");
      res.json({ message: "Incorrect code", status: "disallowed" });
    } else {
      var query = `UPDATE reg_code SET status = "USED" WHERE code = '${code}';`;
      database.query(query, (err, result) => {
        if (err) throw err;
        res.status(200).json({ message: "success" });
      });
    }
  });
};

// };

module.exports = { signup, login, verifyCode };