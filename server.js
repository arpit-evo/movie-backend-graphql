import { ApolloServer } from "@apollo/server";
import responseCachePlugin from "@apollo/server-plugin-response-cache";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { InMemoryLRUCache } from "@apollo/utils.keyvaluecache";
import cors from "cors";
import express from "express";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import http from "http";
import mongoose from "mongoose";
import loadMovieGraphQLSchema from "./src/graphql/movie/index.js";
import loadUserGraphQLSchema from "./src/graphql/user/index.js";
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

const cache = new InMemoryLRUCache();

const movieServer = new ApolloServer({
  typeDefs: movieTypeDef,
  resolvers: movieResolvers,
  introspection: true,
  cache,
  plugins: [
    responseCachePlugin(),
    ApolloServerPluginCacheControl({ defaultMaxAge: 60 }),
    ApolloServerPluginDrainHttpServer({ httpServer }),
  ],
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
      return { user, cache };
    },
  })
);

mongoose.connect("mongodb://localhost:27017/movie").then(async () => {
  console.log("database connected");
  await new Promise((resolve) =>
    httpServer.listen({ port: process.env.PORT }, resolve)
  ).then((res) => console.log(`Server started at: http://localhost:4000`));
});
