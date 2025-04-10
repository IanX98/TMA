const { gql } = require("apollo-server-express");

const typeDefs = gql`
enum CacheControlScope {
  PUBLIC
  PRIVATE
}

directive @cacheControl(
  maxAge: Int
  scope: CacheControlScope
  inheritMaxAge: Boolean
) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

enum Role {
    client
    admin
  }

  type User {
    id: ID!
    role: Role!
    email: String!
    password: String!
    name: String!
    age: Int!
  }

  type Task {
    id: ID!
    title: String!
    description: String
  }

  type Query {
    hello: String
    getUser(id: ID!): User @cacheControl(maxAge: 60)
    getAllUsers: [User] 
    getAllTasks: [Task]
    getTask(id: ID!): Task
    getPaginatedTasks(page: Int, limit: Int): [Task]
  }

  type Mutation {
  createUser(role: Role!, email: String!, password: String!, name: String!, age: Int!): User
  deleteUser(id: ID!): Boolean
  addTask(title: String!, description: String): Task
  deleteTask(id: ID!): Boolean
  updateTask(id: ID!, title: String, description: String): Task
}

type Subscription {
  taskAdded: Task!
}
`;

module.exports = typeDefs;
