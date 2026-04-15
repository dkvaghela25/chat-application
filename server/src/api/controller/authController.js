// controllers/authController.js
import { RequestInputError, ValidationError } from "../../helper/errors.js";
import validationSchema from "../../helper/validate.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {

    const { name, username, email, password } = req.body;

    if (!name) throw new RequestInputError('Name is required');
    if (!username) throw new RequestInputError('User Name is required');
    if (!email) throw new RequestInputError('Email Id is required');
    if (!password) throw new RequestInputError('Password is required');

    const validationResult = validationSchema({ email, password });
    if (!validationResult.success) throw new ValidationError(validationResult.message);

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) throw new RequestInputError('Email Id is required');
    if (!password) throw new RequestInputError('Password is required');

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: "User does not exist please register first" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(200).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      username: user.username
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};