import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import express from "express";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import http from "http";
import mongoose from "mongoose";
import loadUserGraphQLSchema from "./src/graphql/user/index.js";
import loadMovieGraphQLSchema from "./src/graphql/movie/index.js";

const app = express();
const httpServer = http.createServer(app);

const { userTypeDef, userResolovers } = await loadUserGraphQLSchema();
const { movieTypeDef, movieResolvers } = await loadMovieGraphQLSchema();

const userServer = new ApolloServer({
  typeDefs: userTypeDef,
  resolvers: userResolovers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
const movieServer = new ApolloServer({
  typeDefs: movieTypeDef,
  resolvers: movieResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await userServer.start();
await movieServer.start();

app.use("/user", cors(), express.json(), expressMiddleware(userServer));
app.use(
  "/movie",
  cors(),
  express.json(),
  graphqlUploadExpress(),
  expressMiddleware(movieServer)
);

mongoose.connect("mongodb://localhost:27017/movie").then(async () => {
  console.log("database connected");
  await new Promise((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  ).then((res) => console.log(`Server started at: http://localhost:4000`));
});
