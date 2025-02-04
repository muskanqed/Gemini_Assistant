const { Router } = require("express");
const bcrypt = require("bcrypt");
const { userModel } = require("../models/userModel");
const { userSignupSchema, userLoginSchema } = require("../utils/validation");
const {generateToken} = require("../utils/tokenGenerator");
const { validateRequest } = require("../middleware/validationRequest");


const userRoute = Router();

userRoute.post(
  "/signup",
  validateRequest(userSignupSchema),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hasedPassword = await bcrypt.hash(password, 5);

      const userCreated = await userModel.create({
        name,
        email,
        password: hasedPassword,
      });

      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

userRoute.post("/login",
  validateRequest(userLoginSchema),
  async (req, res) => {
  const { email, password } = req.body;

  try {
    const userFound = await userModel.findOne({ email });

    if (!userFound) {
      return res.status(404).json({
        message: "User not found, please signup",
      });
    }
    if (!userFound || !userFound.password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordMatch = await bcrypt.compare(password, userFound.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(userFound._id);

    res.setHeader("Authorization", `Bearer ${token}`);

    res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = { userRoute };
