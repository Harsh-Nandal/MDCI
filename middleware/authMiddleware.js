const jwt = require("jsonwebtoken");
const Admin = require("../models/AdminModel");

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.admin = await Admin.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token failed" });
  }
};

module.exports = protect;
