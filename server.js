require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const reg = require("./routes/registration");
const payments = require("./routes/paymentRoutes");
const verifyAndSendData = require("./routes/verifyAndSendData");
// const signupSeller = require("./routes/signupSeller");
// const signupAdmin = require("./routes/signupAdmin");
// const multer = require("multer");
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: [
      "http://localhost:5172",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(bodyParser.json({ limit: "10mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get("/", (req, res) => {
  res.send("welcome to backend system...");
});

app.use("/api", reg);
app.use("/api", payments)
app.use("/api", verifyAndSendData)

const port = process.env.PORT || 8080;
console.log(new Date());

server.listen(port, () => {
  console.log("Server is running on port", port);
});