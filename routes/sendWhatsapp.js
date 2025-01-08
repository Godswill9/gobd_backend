const puppeteer = require('puppeteer');
const express=require('express')
const route=express.Router()


route.post('/sendWhatsapp', async (req, res) => {
    try {
      const message = req.body.message;
      const phoneNumber = '2348125746595'; // Phone number in international format (without '+')
  
      // Call sendWhatsAppMessage and wait for it to complete
      await sendWhatsAppMessage(phoneNumber, message);
  
      // Send a success response once the message is sent
      res.status(200).json({ message: "WhatsApp message sent" });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      res.status(500).json({ message: "Error sending message" });
    }
  });
async function sendWhatsAppMessage(phoneNumber, message) {
    // Launch the browser with Puppeteer (set headless: false to see the process)
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
  
    // Go to the WhatsApp Web API page dynamically
    const url = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
    await page.goto(url);
  
    // Wait for the parent class to load
    const parentSelector = '._9vd6._9t33._9bir._9bj3._9bhj._9v12._9tau._9tay._9u6w._9se-._9u5y';
    await page.waitForSelector(parentSelector, { visible: true });
  
    // Select the 'a' tag inside the parent class
    const linkSelector = `${parentSelector} a`;
  
    // Wait for the link to be available
    await page.waitForSelector(linkSelector, { visible: true });
  
    // Click on the 'a' tag to open the WhatsApp message page
    await page.click(linkSelector);
  
    // Wait for the page to load (you can adjust the timeout if necessary)
    // await page.waitForTimeout(5000); // Adjust the time based on your network speed
    // await page.waitFor(5000);
    console.log('Message link clicked, and message is sent!');
  
    // Close the browser
    await browser.close();
  }
  
  
  

  module.exports = route;