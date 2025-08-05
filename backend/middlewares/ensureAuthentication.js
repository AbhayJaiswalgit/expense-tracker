const jwt = require("jsonwebtoken");

const ensureAuthentication = async (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    return res.status(403).json({ message: "unauthorized,jwt is req" });
  }
  try {
    const decoded = jwt.verify(auth, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

module.exports = ensureAuthentication;
