import express from "express";
import {
  createStyle,
  getStyles,
  getStyleById,
  updateStyle,
  deleteStyle,
} from "../controllers/styleController.js";
import upload from "../middleware/uploadMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import { body, param, query } from "express-validator";
import { handleValidationErrors } from "../middleware/validationResultHandler.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    upload.single("styleImage"),
    [
      body("name")
        .trim()
        .notEmpty()
        .withMessage("Style name is required.")
        .escape(),
      body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required.")
        .isIn([
          "Traditional",
          "Wedding",
          "Casual",
          "Corporate",
          "Evening Wear",
          "Other",
        ])
        .withMessage("Invalid category selected.")
        .escape(),
      body("description").optional().isString().trim().escape(),
    ],
    handleValidationErrors,
    createStyle
  )
  .get(
    protect,
    [
      query("category")
        .optional()
        .isString()
        .trim()
        .isIn([
          "Traditional",
          "Wedding",
          "Casual",
          "Corporate",
          "Evening Wear",
          "Other",
        ])
        .withMessage("Invalid category for filtering."),
      query("name").optional().isString().trim(),
    ],
    handleValidationErrors,
    getStyles
  );

router
  .route("/:id")
  .get(
    protect,
    [param("id").isMongoId().withMessage("Invalid style ID format.")],
    handleValidationErrors,
    getStyleById
  )
  .put(
    protect,
    upload.single("styleImage"),
    [
      param("id").isMongoId().withMessage("Invalid style ID format."),
      body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Style name cannot be empty if provided.")
        .escape(),
      body("category")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Category cannot be empty if provided.")
        .isIn([
          "Traditional",
          "Wedding",
          "Casual",
          "Corporate",
          "Evening Wear",
          "Other",
        ])
        .withMessage("Invalid category selected if provided.")
        .escape(),
      body("description").optional().isString().trim().escape(),
    ],
    handleValidationErrors,
    updateStyle
  )
  .delete(
    protect,
    [param("id").isMongoId().withMessage("Invalid style ID format.")],
    handleValidationErrors,
    deleteStyle
  );

export default router;
