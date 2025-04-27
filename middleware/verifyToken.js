import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // We using req.cookies.token  cause we used it to sign the first token from generateTokenAndSetCookie function

  const token = req.cookies.token;

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - no token provided" });
  try {
    // We using the JWT_SECRET to verify the token cause we used it to sign the first token from generateTokenAndSetCookie function
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });
    req.userId = decoded.userId; // getting the userId from the token and setting it to the req object
    next(); // calling the next middleware
  } catch (error) {
    console.log("Error in verify token:", error);
    return res.status(500).json({ success: false, message: " Server error" });
  }
};
