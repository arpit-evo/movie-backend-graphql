import cloudinary from "../../middleware/cloudinary.middleware.js";
import Movie from "../../models/Movie.js";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import { createWriteStream, unlink } from "fs";
import { finished } from "stream/promises";

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    getMovies: async () => {
      return await Movie.find();
    },
    getMovieById: async (_, { id }) => {
      return await Movie.findById(id);
    },
  },
  Mutation: {
    addMovie: async (_, { input, file }) => {
      const { filename, createReadStream } = await file;

      const tempPath = `./src/uploads/${filename}`;

      const stream = createReadStream();
      const out = createWriteStream(tempPath);
      stream.pipe(out);
      await finished(out);

      try {
        const response = await cloudinary.uploader.upload(tempPath);
        unlink(tempPath, (err) => {
          if (err) throw err;
        });
        const newMovie = new Movie({
          title: input.title,
          publishingYear: input.publishingYear,
          imageUrl: response.url,
        });

        await newMovie.save();

        return newMovie;
      } catch (error) {
        console.log(error);
      }
    },
    updateMovie: async (_, { id, input, file }) => {
      let url;
      try {
        let movie = await Movie.findById(id);

        if (!movie) {
          throw new Error("movie not found");
        }

        if ((await file) !== undefined) {
          const { filename, createReadStream } = await file;
          const tempPath = `./src/uploads/${filename}`;
          const stream = createReadStream();
          const out = createWriteStream(tempPath);
          stream.pipe(out);
          await finished(out);

          const response = await cloudinary.uploader.upload(tempPath);
          url = response.url;

          unlink(tempPath, (err) => {
            if (err) throw err;
          });
        }

        const updatedMovie = {
          title: input.title || movie.title,
          publishingYear: input.publishingYear || movie.publishingYear,
          imageUrl: url || movie.imageUrl,
        };

        movie = await Movie.findByIdAndUpdate(id, updatedMovie, { new: true });

        return movie;
      } catch (error) {
        console.log(error);
      }
    },
    deleteMovie: async (_, { id }) => {
      try {
        await Movie.findByIdAndDelete(id);
        return "Movie is deleted";
      } catch (error) {
        console.log(error);
      }
    },
  },
};

export default resolvers;