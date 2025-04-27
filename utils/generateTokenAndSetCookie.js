import jwt from "jsonwebtoken";

// Creating token and setting cookie
export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true, // only accessible by the web server to prevent XSS attacks
    secure: process.env.NODE_ENV === "production", // set to true if using HTTPS
    sameSite: "strict", // helps prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
  return token;
};
