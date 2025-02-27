const database = require("../database");
const { v4 } = require("uuid");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");


const findUsers = async (req, res, next) => {
        const query = "SELECT * FROM users";
        database.query(query, (err, result) => {
            if (err) {
                return next(err); // Pass error to next middleware
            }
            res.send(result || []);
        });
};

const findUser = async (req, res, next) => {
    const { id, myId } = req.body;

        const userQuery = "SELECT * FROM users WHERE id = ?";
        database.query(userQuery, [id], (err, userResult) => {
            if (err) return next(err);

            if (!userResult.length) {
                return res.status(404).send({ message: "User not found" });
            }

            // const { name, img } = userResult[0];

            const messageQuery = `
                SELECT * FROM messages 
                WHERE (myId = ? AND otherId = ?) OR (myId = ? AND otherId = ?)
            `;
            database.query(messageQuery, [myId, id, id, myId], (err, messageResult) => {
                if (err) return next(err);
                res.send({ messages: messageResult || [], user:userResult[0] });
            });
        });
};

const sendMessage = async (req, res, next) => {
    const messageId = v4();
    const { message, id, time } = req.body;

    console.log(req.body);

    const sql = "INSERT INTO messages (id, message, myId, otherId, timeRecieved, seen_by_admin, seen_by_user) VALUES ?";
    const values = [[messageId, message, id, 'admin', time, "NOT_SEEN", "SEEN"]];

    database.query(sql, [values], (err, result) => {
        if (err) {
            console.error("Error sending message:", err);
            return res.status(500).json({ message: "Error sending message", error: err.message });
        }

        res.status(201).json({
            message: "Message sent successfully"
        });
    });
};

const sendMessageAdmin = async (req, res, next) => {
    const messageId = v4()
    const { message, id, otherId, time } = req.body;

    const sql = "INSERT INTO messages (id, message, myId, otherId, timeRecieved, seen_by_admin, seen_by_user) VALUES ?";
    const values = [[messageId, message, "admin", otherId, time,"SEEN", "NOT_SEEN"]];

    database.query(sql, [values], (err, result) => {
        if (err) {
            console.error("Error sending message:", err);
            return res.status(500).json({ message: "Error sending message", error: err.message });
        }

        res.status(201).json({ message: "Message sent successfully", data: { id: result.insertId, content: message } });
    });
};


const fetchMessages = async (req, res, next) => {
    const { myId, friend } = req.body;
console.log(req.body)
        const query = `
            SELECT * FROM messages 
            WHERE (myId = ? AND otherId = ?) OR (myId = ? AND otherId = ?)
        `;
        database.query(query, [myId, friend, friend, myId], (err, result) => {
            if (err) return next(err);
            res.status(201).json({result})
        });
};
const fetchAllMessages = async (req, res, next) => {
        const query = `
            SELECT * FROM messages `;
        database.query(query, (err, result) => {
            if (err) return next(err);
            res.status(201).json({result})
            console.log(result)
        });
};

//verify userSeen
const editMessageSeenByUser = async (req, res, next) => {
    var { messageId, userId } = req.body;
    // console.log(req.body);
    var query = `UPDATE messages SET seen_by_user="SEEN" WHERE id = '${messageId}' AND myId = 'admin';`;
    database.query(query, (err, result) => {
      if (err) throw err;
      res.status(200).json({ message: "message read" });
    });
  };

//verify userSeen
const editMessageSeenByAdmin = async (req, res, next) => {
    var { messageId, userId } = req.body;
    // console.log(req.body);
    var query = `UPDATE messages SET seen_by_admin="SEEN" WHERE id = '${messageId}' AND otherId = 'admin';`;
    database.query(query, (err, result) => {
      if (err) throw err;
      res.status(200).json({ message: "message read" });
    });
  };

  const sendMessageMail = async (req, res, next) => {
    const { message, userEmail, type } = req.body;
    console.log(req.body);
  
    // Set up transporter for sending emails
    let transporter = nodemailer.createTransport({
      host: "premium30.web-hosting.com", // Replace with Namecheap SMTP server
      port: 465,
      secure: true,
      auth: {
        user: "support@asoroautomotive.com", // Replace with your client's email address
        pass: "@Automobile1998", // Replace with your client's email password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  
    // Determine the email content based on the message type
    let emailContent = type === "image"
      ? `<p style="color: #333; font-size: 18px;">A file has been sent to the chat.</p>`
      : `<p style="color: #333; font-size: 18px;">${message}</p>`;
  
    // Send email
    let info = await transporter.sendMail({
      from: '"Asoro Automotive" <support@asoroautomotive.com>',
      to: `${userEmail}`,
      subject: "You have a new message!",
      html: `
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" width="600" style="margin: 0 auto;">
            <tr>
              <td style="padding: 20px 0; text-align: center; background-color: blue;">
                <h1 style="color: #fff;">New message</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <div style="background-color: #fff; padding: 20px;">
                  <h2 style="color: #333;">Message reply!</h2>
                  ${emailContent}
                  <a href="https://web-1mpd.onrender.com/chat" style="display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: blue; color: white; text-decoration: none; border-radius: 5px;">Reply</a>
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
  
    console.log("Email sent:", info.messageId);
  };
  
  const sendMessageMailToAdmin = async (req, res, next) => {
    const { message, sender, type } = req.body;
    console.log(req.body);
  
    // Capitalize sender name
    const formattedSender = sender.charAt(0).toUpperCase() + sender.slice(1);
  
    // Set up transporter for sending emails
    let transporter = nodemailer.createTransport({
      host: "premium30.web-hosting.com", // Replace with Namecheap SMTP server
      port: 465,
      secure: true,
      auth: {
        user: "support@asoroautomotive.com", // Replace with your client's email address
        pass: "@Automobile1998", // Replace with your client's email password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  
    // Determine the email content based on the message type
    let emailContent = type === "image"
      ? `<p style="color: #333; font-size: 18px;">An image has been sent to the chat.</p>`
      : `<p style="color: #333; font-size: 18px;">${message}</p>`;
  
    // Send email
    let info = await transporter.sendMail({
      from: '"Asoro Automotive" <support@asoroautomotive.com>',
      to: ["support@asoroautomotive.com", "ghycinth9@gmail.com"],
      subject: "You have a new message!",
      html: `
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" width="600" style="margin: 0 auto;">
            <tr>
              <td style="padding: 20px 0; text-align: center; background-color: blue;">
                <h1 style="color: #fff;">New message</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <div style="background-color: #fff; padding: 20px;">
                  <h2 style="color: #333;">Message Received</h2>
                  ${emailContent}
                  <a href="https://web-1mpd.onrender.com/chat" style="display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: blue; color: white; text-decoration: none; border-radius: 5px;">Reply</a>
                  <p style="color: #333; font-size: 11px; font-weight: bold;">From: ${formattedSender}</p>
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
  
    console.log("Admin email sent:", info.messageId);
  };
  
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFiles = async (req, res, next) => {
  const messageId = v4(); // Generate a unique message ID
  try {
    // Parse files, senderId, and receiverId from the request body
    const { files, senderId, receiverId } = req.body;
    const filesId = v4(); // Generate a unique ID for this upload
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(req.body);

    // Ensure files are provided
    if (!files || files.length === 0) {
      return res.status(400).send({ error: 'No files provided' });
    }

    // Ensure `files` is an array (even if it's a single file)
    const filesArray = Array.isArray(files) ? files : [files];  // Wrap in an array if it's not

    // Array to store uploaded file URLs
    const uploadedFileUrls = [];

    // Process each file asynchronously
    const uploadPromises = filesArray.map((file) => {
      return new Promise((resolve, reject) => {
        // Upload each file to Cloudinary
        cloudinary.uploader.upload(file, { folder: 'products' }, (error, result) => {
          if (error) {
            return reject(error);
          }

          // Ensure we're using the actual file's name, not the string "file.originalname"
          const saveFileQuery = `
            INSERT INTO all_files (
              file_id, sender_id, file_path, file_type, file_name, receiver_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          const values = [
            filesId, 
            senderId, 
            result.secure_url,  // Cloudinary URL
            "image", 
           "file.originalname",  // Use actual file name
            receiverId, 
            date,
          ];

          // Save file details in the database
          database.query(saveFileQuery, values, (err, dbResult) => {
            if (err) {
              return reject(err);
            }

            // Add the uploaded file URL to the array
            uploadedFileUrls.push(result.secure_url); // Add the URL to the array
            resolve(dbResult); // Resolve the promise with the dbResult
          });
        });
      });
    });

    // Wait for all file uploads to complete
    await Promise.all(uploadPromises);

    console.log("Uploaded file URLs:", uploadedFileUrls); // Log the URLs for debugging

    // Insert the message with all file URLs once file uploads are completed
    const sql = "INSERT INTO messages (id, message, myId, otherId, timeRecieved, seen_by_admin, seen_by_user) VALUES ?";
    const values = uploadedFileUrls.map((url) => [
      messageId,  // Message ID for each file
      url,         // File URL
      senderId,    // Sender ID
      receiverId,  // Receiver ID
      date,        // Time received
      senderId == "admin" ? "SEEN" : "NOT_SEEN", // Seen by admin
      senderId == "admin" ? "NOT-SEEN" : "SEEN" //Seen by user
    ]);

    // Execute database query to insert messages
    database.query(sql, [values], (err, result) => {
      if (err) {
        console.error("Error sending message:", err);
        return res.status(500).json({ message: "Error sending message", error: err.message });
      }

      // Send success response with the image URLs back to the frontend
      res.status(201).json({
        message: "Message sent successfully",
        fileUrls: uploadedFileUrls,  // Include file URLs in the response
      });
    });

  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

const sendWhatsappMessageToAdmin = async (msg, sender, type) => {
  try {
    // Capitalize the sender's name (first letter uppercase)
    const capitalizedSender = sender.charAt(0).toUpperCase() + sender.slice(1);
    let message;

    if (type === "image") {
      message = await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // Twilio's WhatsApp number
        to: `whatsapp:+2348125746595`, // Recipient's WhatsApp number
        body: `*A user named ${capitalizedSender} sent media file(s)*`,
      });
    } else {
      message = await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // Twilio's WhatsApp number
        to: `whatsapp:+2348125746595`, // Recipient's WhatsApp number
        body: `*A user named ${capitalizedSender} sent a message:* ${msg}`,
      });
    }

    console.log(`Message sent! SID: ${message.sid}`);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

  

module.exports = { findUsers, findUser, sendMessage, sendMessageMail, sendMessageMailToAdmin, fetchMessages, sendMessageAdmin, fetchAllMessages, editMessageSeenByAdmin, editMessageSeenByUser, uploadFiles, sendWhatsappMessageToAdmin };
