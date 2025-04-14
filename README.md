# 🚀 TMA - API GraphQL com Autenticação e Subscriptions

Este projeto é uma API GraphQL construída com **Node.js**, **Express** e **Apollo Server**, utilizando **JWT para autenticação**, **bcrypt para hash de senhas**, e **WebSockets para subscriptions** em tempo real. Ideal para aplicações que precisam de comunicação em tempo real com segurança.

## 🧱 Tecnologias Utilizadas

- Node.js  
- Express.js  
- Apollo Server  
- GraphQL  
- JWT (jsonwebtoken)  
- bcrypt  
- graphql-ws (subscriptions)  
- Mongoose / MongoDB  
- dotenv  
- Winston (logs)  
- Render (deploy)

---

## 🔐 Autenticação

- Registre um novo usuário via `/register`
- Faça login via `/login` e receba um token JWT
- Envie o token no header das requisições GraphQL:
Authorization: Bearer <seu-token>

---

## 📡 Subscriptions

A API suporta GraphQL Subscriptions via WebSocket:

- Endpoint WebSocket: `ws://<seu-servidor>/graphql`
- Usa `graphql-ws`

---

## 🚀 Como Rodar Localmente

1. Instale as dependências:
   ```bash
   npm install

---

## ⚙️ .Env

- Crie um .env na raiz do projeto
- Atribua as seguintes variáveis:
  MONGO_URI=<sua-string-do-mongodb>
  JWT_SECRET=<sua-chave-jwt>

Com tudo configurado de forma correta apenas rodar -> node.server.js

---

## 🧪 Testes de Queries

  query {
  getUser(id: "id-do-usuario") {
    name
    email
    age
  }
}



