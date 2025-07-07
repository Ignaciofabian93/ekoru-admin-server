import { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { getAccessTokenCookieOptions } from "../config/cookies";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  // If no tokens are present, return unauthorized
  if (!accessToken && !refreshToken) {
    console.log("No authentication tokens provided");
    return res
      .status(401)
      .json({ message: "No authentication tokens provided" });
  }

  // First, try to verify the access token
  if (accessToken) {
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_SECRET as string
      ) as JwtPayload;
      req.user = decoded;
      return next();
    } catch (error) {
      // Access token is invalid or expired, try refresh token
      console.error("Access token invalid/expired, trying refresh token");
    }
  }

  // If access token is missing or invalid, try refresh token
  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      ) as JwtPayload;

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" }
      );

      // Set new access token in cookie
      res.cookie("token", newAccessToken, getAccessTokenCookieOptions());

      // Set user in request
      req.user = decoded;
      return next();
    } catch (error) {
      // Both tokens are invalid
      return res.status(401).json({ message: "Invalid authentication tokens" });
    }
  }

  return res.status(401).json({ message: "Authentication failed" });
};
