// utils/jwt.js
import { sign } from "jsonwebtoken";

export function generateAccessToken(userId)  {   return sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });   }

export function generateRefreshToken(userId)  {   return sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });   }
