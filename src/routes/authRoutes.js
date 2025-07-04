import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import { body } from "express-validator";
import { handleValidationErrors } from "../middleware/validationResultHandler.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required.")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters long.")
      .escape(), // Sanitize name
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .normalizeEmail(), // Email is generally not escaped to preserve its format, but validated strictly
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
    body("isAdmin")
      .optional()
      .isBoolean()
      .withMessage("isAdmin must be a boolean value."),
  ],
  handleValidationErrors,
  registerUser
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  handleValidationErrors,
  loginUser
);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(
    protect,
    [
      body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty if provided.")
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters long if provided.")
        .escape(), // Sanitize name
      body("email")
        .optional()
        .isEmail()
        .withMessage("Please provide a valid email address if updating.")
        .normalizeEmail(),
      body("password")
        .optional()
        .isLength({ min: 6 })
        .withMessage(
          "New password must be at least 6 characters long if provided."
        ),
    ],
    handleValidationErrors,
    updateUserProfile
  );

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

export default router;
