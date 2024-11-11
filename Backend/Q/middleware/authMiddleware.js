const jwt = require("jsonwebtoken");
const  User = require("../models/User");

const auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Assign decoded userId to req for easy access

    const user = await User.findById(decoded.userId); // Find user by decoded ID
    if (!user) {
      return res.status(401).json({ message: "Invalid token" }); 
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) { 
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Unauthorized" });
  } 
};

module.exports = auth;
 