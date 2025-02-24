import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// import { IUser } from "../models/User";

// Define just the JWT payload type
interface JWTPayload {
  id: string;
  role: "user" | "admin";
  exp: number;
}

const jwtAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JWTPayload;

    // Attach minimal user data from token
    (req as any).user = {
      _id: decoded.id,
      role: decoded.role
    };

    // Token refresh logic only if expiring soon
    if (decoded.exp * 1000 - Date.now() < 15 * 60 * 1000) {
      const newToken = jwt.sign(
        { id: decoded.id, role: decoded.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "3h" }
      );

      res.cookie("token", newToken, {
        maxAge: 1000 * 60 * 60 * 3,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    next();
  } catch (error) {
    res.status(403).json({ message: "Authentication failed" });
  }
};

export default jwtAuth;