require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginCacheControl } = require('apollo-server-core');
const { makeExecutableSchema } = require("@graphql-tools/schema");

const connectDB = require("./db/db");
const logger = require('./utils/logger');
const authMiddleware = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const typeDefs = require("./types/user.type");
const resolvers = require("./resolvers/resolver");

async function startServer() {
  const app = express();

  app.use(express.json());
  app.use(authRoutes);
  app.use(authMiddleware);

  await connectDB();

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  useServer(
    {
      schema,
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      return { user: req.user };
    },
    plugins: [
      ApolloServerPluginCacheControl({ defaultMaxAge: 5 }),
    ],
    cache: 'bounded',
    formatError: (err) => {
      logger.error(`GraphQL Error: ${err.message}`);
      return {
        message: err.message,
        code: err.extensions?.code || "INTERNAL_SERVER_ERROR",
        details: err.extensions,
      };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  try {
    httpServer.listen(PORT, () => {
      logger.info('🚀 Server running at http://localhost:4000/graphql');
      logger.info('📡 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}');
    });
  } catch (err) {
    logger.error('An error occurred:', err);
  }
}

startServer();