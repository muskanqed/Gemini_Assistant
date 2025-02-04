const { Router } = require("express");
const bcrypt = require('bcrypt');
const { userModel } = require("../models/userModel");
const { userSignupSchema } = require("../utils/validation");
const { validateRequest } = require("../middlewares/validateMiddleware");
const { authMiddleware } = require("../middlewares/authMiddleware");

const userRoute = Router();

userRoute.post(
  "/signup",
  validateRequest(userSignupSchema),
  authMiddleware,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const userCreated = await userModel.create({ name, email, password });

      res
        .status(201)
        .json({ message: "User created successfully", user: userCreated });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

module.exports = userRoute;
