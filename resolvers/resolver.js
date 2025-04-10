const { PubSub } = require('graphql-subscriptions');
const { ApolloError } = require("apollo-server-errors");
const User = require("../models/User");
const Task = require("../models/Task")

const pubSub = new PubSub();

const TASK_ADDED = 'TASK_ADDED';

const resolvers = {
  User: {
    password: (parent, _, context) => {
      if (!context.user || context.user.userId !== parent._id.toString()) {
        logger.warn("Unauthorized access attempt to access password");
        return null;
      }
      return parent.password;
    },
  },

  Query: {
    getUser: async (_, { id }, context) => {
      if (!context.user) {
        logger.warn("Unauthorized access attempt to getUser");

        throw new ApolloError("Unauthorized", "UNAUTHORIZED");
      }
    
      const user = await User.findById(id);
      if (!user) throw new ApolloError("User not found", "USER_NOT_FOUND");

      return {
      ...user.toObject(),
      __cacheControl: { maxAge: 60 }
    };
    },    
    
    getAllUsers: async () => {
      try {
        return await User.find();
      } catch (error) {
        throw new ApolloError(error.message, "DATABASE_ERROR");
      }
    },

    getTask: async (_, { id }) => {
      try {
        const task = await Task.findById(id);
        if (!task) throw new ApolloError("Task not found", "TASK_NOT_FOUND");
        return task;
      } catch (error) {
        throw new ApolloError(error.message, "DATABASE_ERROR");
      }
    },

    getAllTasks: async () => {
      try {
        return await Task.find()
      }catch (error) {
        throw new ApolloError(error.message, "DATABASE_ERROR");
      }
    },

    getPaginatedTasks: async (_, { page = 1, limit = 10 }) => {
      try {
        const skip = (page - 1) * limit;
        const tasks = await Task.find().skip(skip).limit(limit);
        return tasks;
      } catch (error) {
        throw new ApolloError(error.message, "DATABASE_ERROR");
      }
    }    
  },

  Mutation: {
    createUser: async (_, { role, email, password, name, age }) => {
      try {
        const newUser = new User({ role, email, password, name, age });
        return await newUser.save();
      } catch (error) {
        throw new ApolloError(error.message, "DATABASE_ERROR");
      }
    },

    deleteUser: async (_, { id }) => {
      try {
        const user = await User.findById(id);
        if (!user) {
          throw new ApolloError("User not found", "DATABASE_ERROR");
        }

        await User.findByIdAndDelete(id)

        return true;
      } catch (error) {
        throw new ApolloError(error.message, "DATABASE_ERROR");
      }
    },

    addTask: async (_, { title, description }) => {
      try {
        const newTask = new Task({ title, description });

        pubSub.publish(TASK_ADDED, { taskAdded: newTask });

        return await newTask.save();
      } catch (error) {
        throw new Error("Failed to add task");
      }
    },

    deleteTask: async (_, { id }, context) => {
      console.log(context)
      if (context.user.role !== "admin") {
        logger.warn("Unauthorized access attempt to deleteTask");

        throw new ApolloError("Forbidden: Only admins can delete tasks", "FORBIDDEN");
      }

      try {
        const task = await Task.findById(id);
        if (!task) {
          throw new ApolloError("Task not found", "DATABASE_ERROR");
        }

        await Task.findByIdAndDelete(id)

        return true;
      } catch (error) {
        throw new ApolloError(error.message, "DATABASE_ERROR");
      }
    },

    updateTask: async (_, { id, title, description }, context) => {
      if (context.user.role !== "admin") {
        logger.warn("Unauthorized access attempt to updateTask");
        throw new ApolloError("Forbidden: Only admins can update tasks", "FORBIDDEN");
      }

      try {
        const updatedTask = await Task.findByIdAndUpdate(
          id,
          { $set: { title, description } },
          { new: true }
        );
    
        if (!updatedTask) throw new ApolloError("Task not found", "TASK_NOT_FOUND");
    
        return updatedTask;
      } catch (error) {
        throw new ApolloError(error.message, "DATABASE_ERROR");
      }
    },    
  },

  Subscription: {
    taskAdded: {
      subscribe: () => pubSub.asyncIterableIterator([TASK_ADDED])
    },
  },
};

module.exports = resolvers;
