const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/user");
const nodemailer = require("nodemailer");

const generateToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const generateOTP = () => {
  return Math.floor(10000000 + Math.random() * 900000).toString();
};

const sendMail = async (recEmail, subject, msg) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  let sender = `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`;
  let mailOptions = {
    from: sender,
    to: recEmail,
    subject: subject,
    html: msg,
  };
  await transporter.sendMail(mailOptions);
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user && user.isVerified) {
    return res
      .status(400)
      .json({ message: "Email already in use and verified." });
  }
  const otp = generateOTP();
  console.log(otp);
  if (!user) {
    user = new User({
      name,
      email,
      password,
      verificationCode: otp,
    });
  } else {
    user.password = password;
    user.verificationCode = otp;
  }
  await user.save();
  const token = generateToken(user);
  await sendMail(
    email,
    "Email Verification",
    `Your OTP for email verification is: ${otp}`
  );
  res.status(201).json({
    message:
      "Registration successful. Please check your email to verify your account.",
    token,
  });
};

exports.verifyEmail = async (req, res) => {
  const { verificationCode } = req.body;
  const user = await User.findOne({
    verificationCode: verificationCode.trim(),
  });
  console.log(verificationCode);
  if (!user) {
    return res
      .status(404)
      .json({ message: "User not found or verification code is incorrect." });
  }
  if (user.isVerified) {
    return res.status(400).json({ message: "User already verified." });
  }
  user.isVerified = true;
  user.verificationCode = null;
  await user.save();
  res.status(200).json({ message: "Email verified successfully." });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password"
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid login credentials." });
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return res.status(401).json({ message: "Invalid login credentials." });
  }
  if (!user.isVerified) {
    return res.status(401).json({ message: "Please verify your email first." });
  }
  const token = generateToken(user);
  res.status(200).json({ message: "Login successful.", token });
};
