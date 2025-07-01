import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";
import { connect } from "mongoose";
import passport from "passport";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

config();
import "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/auth.js";

const app = express();

app.use(cors());
app.use(json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const dbUrl = process.env.DATABASE_URL;

connect(dbUrl).then(() => console.log("Mongo connected"));

app.use("/auth", authRoutes);

// Example: Protect a test route
app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authenticated!", user: req.user });
});

app.get("/", (req, res) => res.send("API Running"));

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);
