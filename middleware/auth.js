// middlewares/auth.js
import jwt from "jsonwebtoken";
const { verify } = jwt;

export default (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });

  try {
    const token = auth.split(" ")[1];
    const payload = verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
