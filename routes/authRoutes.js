import express from "express";
import passport from "passport";
import { register, login } from "../controllers/authController.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/google",
  (req, res, next) => {
    console.log(
      "/auth/google route hit, sending to Google with scope: profile, email"
    );
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    const accessToken = generateAccessToken(req.user.id);
    const refreshToken = generateRefreshToken(req.user.id);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to home page after Google OAuth
    res.redirect("http://localhost:3000/");
  }
);

export default router;
