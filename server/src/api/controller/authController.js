import { RequestInputError, ValidationError } from "../../helper/errors.js";
import { sendError } from "../../helper/sendError.js";
import validationSchema from "../../helper/validate.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name) throw new RequestInputError("Name is required", 400);
    if (!username) throw new RequestInputError("Username is required", 400);
    if (!email) throw new RequestInputError("Email is required", 400);
    if (!password) throw new RequestInputError("Password is required", 400);

    const validationResult = validationSchema({ email, password });
    if (!validationResult.success) {
      throw new ValidationError(validationResult.message, 400);
    }

    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken",
      });
    }
    
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email Id is already in use",
      });
    }

    await User.create({ name, username, email, password });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (err) {
    sendError(res, err);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) throw new RequestInputError("Email is required", 400);
    if (!password) throw new RequestInputError("Password is required", 400);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      username: user.username,
    });

  } catch (err) {
    sendError(res, err);
  }
};