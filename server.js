import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
const mongoose = from("mongoose");
const express = from("express");
const http = from("http");
import { processImport } from "@graphql-tools/import";
import { resolvers } from "./src/graphql/resolvers";
const typeDefs = processImport("./src/graphql/schema.graphql");

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

const startApolloServer = async () => {
  await server.start();
};

await startApolloServer();

app.use("/graphql", expressMiddleware(server));

mongoose.connect("mongodb://localhost:27017/movie").then(async () => {
  console.log("database connected");
  await new Promise((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  ).then((res) => console.log(`Server started at: ${res.url}`));
});
