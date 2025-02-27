require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const reg = require("./routes/registration");
const verifyAndSendData = require("./routes/verifyAndSendData");
const verify = require("./routes/verify");

const message = require("./routes/message");
const files = require("./routes/files");
const users = require("./routes/users");
const whatsapp = require("./routes/sendWhatsapp");
const multer = require("multer");
const app = express();
const server = http.createServer(app);
// const io = socketIO(server); // This initializes socket.io for real-time communication
// Set up socket.io with CORS settings
const io = socketIO(server, {
  cors: {
    origin: [
      "http://localhost:5172",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://gobd-admin.onrender.com",
      "https://web-1mpd.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true, // Optional, for handling cookies and sessions
  }
});

// Middlewares for static files and other configurations
app.use(express.static('build'));

app.use(
  cors({
    origin: [
      "http://localhost:5172",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://gobd-admin.onrender.com",
      "https://web-1mpd.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// multer({
//   limits: { fieldSize: 20 * 1024 * 1024 },
// });
// app.use(multer().any());

const upload = multer({
  storage: multer.memoryStorage(), // Store the file in memory (or diskStorage as needed)
  limits: { fileSize: 20 * 1024 * 1024 }, // Set the file size limit (20MB in this case)
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg','image/webp', 'image/png', 'image/gif']; // Allowed file types
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

app.use(upload.any()); 


// Routes for the API
app.get("/", (req, res) => {
  res.send("welcome to backend system...");
});
app.use("/api", reg);
app.use("/api", verifyAndSendData);
app.use("/api", verify);
app.use("/api", message);
app.use("/api", users);
app.use("/api", whatsapp);
app.use("/api", files);

// WebSocket handling: Real-time messaging
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for incoming messages from clients
  socket.on('send_message', (message) => {
    console.log('Received message:', message);

    // Broadcast the message to all connected clients
    io.emit('receive_message', message); // Send to all clients
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Set the port to listen on
const port = process.env.PORT || 8082;
console.log(new Date());

// Start the server with WebSocket
server.listen(port, () => {
  console.log("Server is running on port", port);
});
