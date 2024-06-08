import path from "path";
import url from "url";
import util from "util";

import * as mergeModule from "@graphql-tools/merge";
import * as loadFilesModule from "@graphql-tools/load-files";

const { loadFiles, loadFilesSync } = loadFilesModule;
const { mergeResolvers, mergeTypeDefs } = mergeModule;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typesArray = loadFilesSync(path.join(__dirname, "./**/*.graphql"), {
  extensions: ["graphql"],
});

const resolversArray = await loadFiles(
  path.join(__dirname, "./**/resolvers.js"),
  {
    ignoreIndex: true,
    requireMethod: async (path) => {
      return await import(url.pathToFileURL(path));
    },
  }
);

const resolvers = mergeResolvers(resolversArray);

const typeDefs = mergeTypeDefs(typesArray);

export { typeDefs, resolvers };
