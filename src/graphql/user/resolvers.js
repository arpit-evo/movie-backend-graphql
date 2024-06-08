import User from "../../models/User.js";
import bcryptjs from "bcryptjs";

const resolvers = {
  Query: {
    getUserById: async (_, { id }) => {
      const user = await User.findById(id);

      return user;
    },
    getAllUser: async () => {
      return await User.find();
    },
  },
  Mutation: {
    register: async (_, { input }) => {
      try {
        const hashedPassword = await bcryptjs.hash(input.password, 10);

        const newUser = new User({
          email: input.email,
          password: hashedPassword,
        });

        await newUser.save();

        return newUser;
      } catch (error) {
        console.log(error);
      }
    },
  },
};

export default resolvers