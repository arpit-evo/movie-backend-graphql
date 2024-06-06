const Movie = require("../models/Movie");

const resolvers = {
  Query: {
    hello: () => "hello world",
    getMovies: async () => {
      return await Movie.find();
    },
  },
};

module.exports = resolvers;
