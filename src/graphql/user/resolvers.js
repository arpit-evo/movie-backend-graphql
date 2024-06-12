import { GraphQLError } from "graphql";
import User from "../../models/User.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../../utils/generateToken.js";

const resolvers = {
  Query: {
    getUserById: async (_, { id }) => {
      const user = await User.findById(id);

      return user;
    },
    getAllUser: async () => {
      return await User.find();
    },
  },
  Mutation: {
    register: async (_, { input }) => {
      try {
        const hashedPassword = await bcryptjs.hash(input.password, 10);

        const newUser = new User({
          email: input.email,
          password: hashedPassword,
        });

        await newUser.save();

        return newUser;
      } catch (error) {
        console.log(error);
      }
    },
    login: async (_, { input }) => {
      try {
        const user = await User.findOne({ email: input.email });

        if (!user) {
          throw new GraphQLError("user not found", {
            extensions: {
              code: "NOTFOUND",
              http: { status: 404 },
            },
          });
        }

        const isMatch = bcryptjs.compare(input.password, user.password);

        if (!isMatch) {
          throw new GraphQLError("invalid credentials", {
            extensions: {
              code: "FORBIDDEN",
              http: { status: 400 },
            },
          });
        }

        const { accessToken, refreshToken } = await generateToken(user);

        return {
          message: "user login",
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
      } catch (error) {
        console.log(error);
      }
    },
    refreshToken: async (_, { refreshToken }) => {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET_KEY
        );
        const user = await User.findById(decoded.id);
        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: {
              code: "USER_NOT_FOUND",
              http: { status: 404 },
            },
          });
        }

        const { accessToken, refreshToken: newRefreshToken } =
          await generateToken(user);

        return {
          message: "refresh token successfully ",
          accessToken,
          refreshToken: newRefreshToken,
        };
      } catch (err) {
        throw new GraphQLError("Forbidden", {
          extensions: {
            code: "FORBIDDEN",
            http: { status: 403 },
          },
        });
      }
    },
  },
};

export { resolvers };
