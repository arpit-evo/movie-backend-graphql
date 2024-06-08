import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import express from "express";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import http from "http";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import loadUserGraphQLSchema from "./src/graphql/user/index.js";
import loadMovieGraphQLSchema from "./src/graphql/movie/index.js";
import { GraphQLError } from "graphql";
import User from "./src/models/User.js";
import { authenticateToken } from "./src/middleware/auth.middleware.js";

const app = express();
const httpServer = http.createServer(app);

const { userTypeDef, userResolvers } = await loadUserGraphQLSchema();
const { movieTypeDef, movieResolvers } = await loadMovieGraphQLSchema();

const userServer = new ApolloServer({
  typeDefs: userTypeDef,
  resolvers: userResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
const movieServer = new ApolloServer({
  typeDefs: movieTypeDef,
  resolvers: movieResolvers,
  introspection: true,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await userServer.start();
await movieServer.start();
app.use(cors());
app.use(express.json());
app.use("/user", expressMiddleware(userServer));
app.use(
  "/movie",
  graphqlUploadExpress(),
  expressMiddleware(movieServer, {
    context: async ({ req }) => {
      const user = await authenticateToken(req);
      return { user };
    },
  })
);

mongoose.connect("mongodb://localhost:27017/movie").then(async () => {
  console.log("database connected");
  await new Promise((resolve) =>
    httpServer.listen({ port: process.env.PORT }, resolve)
  ).then((res) => console.log(`Server started at: http://localhost:4000`));
});
