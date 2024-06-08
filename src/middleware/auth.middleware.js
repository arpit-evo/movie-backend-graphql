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

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
    if (err) {
      throw new GraphQLError("Forbidden", {
        extensions: {
          code: "FORBIDDEN",
          http: { status: 401 },
        },
      });
    }

    const user = await User.findById({ _id: decoded.id });
    return user
  });
};
