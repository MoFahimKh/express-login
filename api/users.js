const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { generateOTP, otps } = require("../otp-storage");

dotenv.config();
const router = express.Router();

// Define a secret key for JWT
const jwtSecret = process.env.JWT_SECRET;
const smtpConfig = {
  host: "smtp.gmail.com",
  port: 465,
  ignoreTLS: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
};
// Create a nodemailer transporter
const transporter = nodemailer.createTransport(smtpConfig);

// Login route
router.post("/login", (req, res) => {
  const { email } = req.body;

  // Generate OTP
  const otp = generateOTP();

  // Store the OTP for the user
  otps.set(email, otp);

  // Create a JWT token with the email
  const token = jwt.sign({ email }, jwtSecret, { expiresIn: "45m" });

  // Send the OTP to the user's email
  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: email,
    subject: "OTP for Login",
    text: `Your OTP for login is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send OTP" });
    } else {
      console.log("Email sent: " + info.response);
      res.json({ token });
    }
  });
});

// Verify OTP route
router.post("/verify-otp", (req, res) => {
  const { otp } = req.body;
  const token = req.headers.authorization.split(" ")[1]; //the JWT token is provided in the Authorization header

  // Decode the JWT token to access the email
  const decodedToken = jwt.verify(token, jwtSecret);
  const email = decodedToken.email;
  // Get the stored OTP for the user
  const storedOTP = otps.get(email);
  if (storedOTP === otp) {
    // OTP is valid
    otps.delete(email); // Remove OTP from storage
    res.redirect(`/verify-email.html?email=${encodeURIComponent(email)}`);
  } else {
    // Invalid OTP
    res.status(401).json({ message: "Invalid OTP" });
  }
});

// Get user details route
router.get("/user", (req, res) => {
  const token = req.headers.authorization.split(" ")[1]; // The JWT token is provided in the Authorization header
  try {
    // Verify and decode the JWT token to access the user's email
    const decodedToken = jwt.verify(token, jwtSecret);
    const email = decodedToken.email;
    const userDetails = {
      email: email,
    };
console.log(userDetails)
    res.json(userDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
});

// Logout route
router.get("/logout", (req, res) => {
  // Clear the token from local storage
  res.clearCookie("token");
  res.redirect("/login.html");
});

module.exports = { router };
