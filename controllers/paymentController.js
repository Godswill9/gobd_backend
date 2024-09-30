// //FUND WALLET
const https = require("https");
const database = require("../database");

const payStack = {
  acceptPayment: async (req, res) => {
    try {
      // request body from the clients
      const email = req.body.email;
      // const amount = Number(req.body.amount);
      const amount = 5000
      console.log(req.body);
      // params
      const params = JSON.stringify({
        email: email,
        amount: amount * 100,
      });
      // options
      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: "/transaction/initialize",
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // where you place your secret key copied from your dashboard
          "Content-Type": "application/json",
        },
      };
      // client request to paystack API
      const clientReq = https
        .request(options, (apiRes) => {
          let data = "";
          apiRes.on("data", (chunk) => {
            data += chunk;
          });
          apiRes.on("end", () => {
            // console.log(JSON.parse(data));
            return res.status(200).json(JSON.parse(data));
          });
        })
        .on("error", (error) => {
          console.error(error);
        });
      clientReq.write(params);
      clientReq.end();
    } catch (error) {
      // Handle any errors that occur during the request
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  },
  checkPayment: async (req, res) => {
    const { ref } = req.params;
    console.log(ref);
    try {
      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: `/transaction/verify/${ref}`,
        method: "GET", // Use GET method for verification
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Use your secret key for authorization
          "Content-Type": "application/json",
        },
      };

      const clientReq = https
        .request(options, (apiRes) => {
          let data = "";
          apiRes.on("data", (chunk) => {
            data += chunk;
          });
          apiRes.on("end", () => {
            console.log(JSON.parse(data).data);
            if (JSON.parse(data).data.status === "success") {
              res.status(200).json({
                message: "your payment has been approved",
                status: "payment success",
                ref: ref,
              });
              console.log(JSON.parse(data).data.status);
            } else {
              res.status(200).json({
                message: "your payment has NOT been approved",
                status: "payment failed",
              });
              console.log(JSON.parse(data).data.status);
            }
          });
        })
        .on("error", (error) => {
          console.error(error);
          return res.status(500).json({ error: "An error occurred" }); // Handle errors gracefully
        });

      clientReq.end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  },
  savePayment: async (req, res, next) => {
    const { user_id, amount, subscription_plan, payment_status } = req.body;
  
    // Ensure required fields are present
    if (!user_id || !amount || !subscription_plan || !payment_status) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  
    // Generate a unique ID for the payment (you might want to use a library for this)
    const id = generateUniqueId(); // Implement this function as needed
  
    try {
      const query = `
        INSERT INTO payments (id, user_id, amount, subscription_plan, payment_status)
        VALUES (?, ?, ?, ?, ?)`;
      
      const values = [id, user_id, amount, subscription_plan, payment_status];
  
      database.query(query, values, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({ message: "Payment saved successfully", paymentId: id });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

function generateUniqueId() {
  return 'payment_' + Date.now(); // Simple ID generation; consider using UUIDs for better uniqueness
}

const initializePayment = payStack;

module.exports = initializePayment;