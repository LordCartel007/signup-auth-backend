import { User } from "../models/user.model.js";

import crypto from "crypto"; // for generating random tokens

// for password hashing
import bcryptjs from "bcryptjs";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../mailtrap/emails.js";

export const signup = async (req, res) => {
  const email = req.body.email.toLowerCase(); // 👈 making email lower case
  const { password, name } = req.body;
  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    const userAlreadyExists = await User.findOne({ email });
    // checking if users exist
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Generate a random 6-digit verification token
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Save the user to the database

    await user.save();

    //jwt
    generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      // spreading the user object to get all the user data then making the password null
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  // 1 2 3 4 5 6
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      // checking if the token is not expired
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    //  turning is verified in the database to true
    user.isVerified = true;

    // changing the verification token and expires at in database to null
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    // saving the user to the database
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Error in verify email:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const { password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    // checking if the password is correct
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ⛔️ If user exists but not verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
        redirectToVerify: true, // 👈 frontend can check this
        userId: user._id, // optional: if you want to auto-send the email or prefill email
      });
    }

    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in login:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    //send email
    // reset url
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    ); // replace with your frontend URL

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgot password:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // find the user and change token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }
    //update password
    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ sucess: true, message: "Password reset successfully" });
  } catch (error) {
    console.log("Error in reset password:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    // removing password from the user object by using select -password
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({ sucess: true, user });
  } catch (error) {
    console.log("Error in checkAuth:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
