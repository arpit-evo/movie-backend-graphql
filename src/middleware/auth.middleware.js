import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import User from "../models/User.js ";

export const authenticateToken = async (req) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new GraphQLError("Unauthorized", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new GraphQLError("User not found", {
        extensions: {
          code: "USER_NOT_FOUND",
          http: { status: 404 },
        },
      });
    }
    return user;
  } catch (err) {
    throw new GraphQLError("Forbidden", {
      extensions: {
        code: "FORBIDDEN",
        http: { status: 403 },
      },
    });
  }
};
