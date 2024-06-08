import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {resolvers as userResolvers} from "./resolvers.js"; // Adjust the path to where your resolvers are located

async function loadUserGraphQLSchema() {
  const userTypeDef = await loadSchema(path.join(__dirname, "./schema.graphql"), {
    loaders: [new GraphQLFileLoader()],
  });

  return { userTypeDef, userResolvers };
}

export default loadUserGraphQLSchema;
