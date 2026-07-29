const jwt = require("jsonwebtoken");

const ensureAuthentication = async (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }
  try {
    const decoded = jwt.verify(auth, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // jwt.verify throws if token is expired, tampered, or uses wrong secret
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
};

module.exports = ensureAuthentication;
