const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const mongoose = require("mongoose");
const resolvers = require("./src/graphql/resolvers");
const { processImport } = require("@graphql-tools/import");
const typeDefs = processImport("./src/graphql/schema.graphql");

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
});

mongoose.connect("mongodb://localhost:27017/movie").then(async () => {
  console.log("database connected");
  await startStandaloneServer(server, {
    listen: { port: 4000 },
  }).then((res) => console.log(`Server started at: ${res.url}`));
});
