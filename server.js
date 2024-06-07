import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import express from "express";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import http from "http";
import mongoose from "mongoose";
import resolvers from "./src/graphql/resolvers.js";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";
const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs: await loadSchema("./src/graphql/schema.graphql", {
    loaders: [new GraphQLFileLoader()],
  }),
  resolvers: resolvers, 
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  "/graphql",
  cors({
    origin: ["http://localhost:4000/graphql"],
  }),
  express.json(),
  graphqlUploadExpress(),
  expressMiddleware(server)
);

mongoose.connect("mongodb://localhost:27017/movie").then(async () => {
  console.log("database connected");
  await new Promise((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  ).then((res) => console.log(`Server started at: http://localhost:4000`));
});
