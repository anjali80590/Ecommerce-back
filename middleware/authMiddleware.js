const jwt = require("jsonwebtoken");
const User = require("../model/user");

exports.requireAuth = (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      throw new Error("Authentication failed. No user ID present in token.");
    }

    req.user = { id: decoded.userId };
    console.log("decoded", decoded);
    console.log("User ID from token:", req.user.id);

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ error: "Please authenticate." });
  }
};

exports.requireEmailVerified = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.isVerified) {
      return res.status(403).send({ error: "Email not verified." });
    }

    next();
  } catch (e) {
    res.status(500).send({ error: "Server error." });
  }
};

exports.authAndEmailVerified = [
  exports.requireAuth,
  exports.requireEmailVerified,
];
