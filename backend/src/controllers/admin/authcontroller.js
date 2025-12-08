const db = require("../../models");
const User = db.User;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { getRoleModulesActions } = require("../../helpers/accessHelper");

const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;


function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: EMAIL_APP_PASSWORD
  }
});

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });
    const isMatch = user.password === password;
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Incorrect password" });
    const access = user.role_id ? await getRoleModulesActions(user.role_id) : [];
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      access
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otp_expiry = expiry;
    await user.save();

    const mailOptions = {
      from: EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}.`,
      html: `<h2>Your OTP is <b>${otp}</b></h2>`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
}

async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email & OTP required" });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (!user.otp || !user.otp_expiry)
      return res.status(400).json({ success: false, message: "No OTP requested" });

    if (new Date() > user.otp_expiry)
      return res.status(400).json({ success: false, message: "OTP expired" });

    if (String(otp) !== String(user.otp))
      return res.status(401).json({ success: false, message: "Invalid OTP" });

    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    return res.status(200).json({ success: true, message: "OTP verified", user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { login, sendOtp, verifyOtp };
