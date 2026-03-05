# Gamers Community - API + Frontend com Node.js

Projeto full stack simples para cadastro, login e validacao de rota protegida com JWT.

## Tecnologias

- Node.js
- Express
- JSON local como banco de dados
- bcrypt para hash de senha
- jsonwebtoken para autenticacao
- dotenv para variaveis de ambiente
- nodemon para desenvolvimento

## Funcionalidades

- Status da API na interface
- Cadastro de usuario
- Login de usuario
- Listagem de usuarios sem expor hash da senha
- Rota protegida com token (`GET /api/profile`)
- Exclusao da propria conta (`DELETE /api/users/:id`)
- Botao no frontend para excluir conta logada
- Persistencia local em `src/db.json`

## Estrutura do projeto

```text
.
|- assets/
|- src/
|  |- controllers/
|  |  |- authController.js
|  |  |- healthController.js
|  |  `- usersController.js
|  |- middlewares/
|  |  `- authMiddleware.js
|  |- routes/
|  |  `- index.js
|  |- utils/
|  |  |- db.js
|  |  `- jwt.js
|  |- db.json
|  |- script.js
|  `- server.js
|- .env.example
|- .gitignore
|- index.html
|- style.css
`- package.json
```

## Variaveis de ambiente

Crie um arquivo `.env` na raiz baseado no `.env.example`:

```env
PORT=3000
JWT_SECRET=dev-secret-change-in-production
```

## Como executar

1. Instalar dependencias:

```bash
npm install
```

2. Rodar em desenvolvimento:

```bash
npm run dev
```

3. Abrir no navegador:

```text
http://localhost:3000
```

Para rodar sem nodemon:

```bash
npm start
```

## Endpoints da API

- `GET /api/health`
  - Retorna status da API.
- `GET /api/users`
  - Lista usuarios publicos (`id`, `username`, `createdAt`).
- `POST /api/register`
  - Body: `{ "username": "...", "password": "..." }`
  - Valida obrigatoriedade, minimo de 6 caracteres na senha e username unico.
- `POST /api/login`
  - Body: `{ "username": "...", "password": "..." }`
  - Retorna token JWT e dados basicos do usuario.
- `GET /api/profile`
  - Requer header `Authorization: Bearer <token>`.
  - Retorna dados do usuario autenticado.
- `DELETE /api/users/:id`
  - Requer header `Authorization: Bearer <token>`.
  - Permite excluir apenas a propria conta (id da URL deve ser o mesmo do token).

## Frontend

Na secao de rota protegida existem dois botoes:

- `Load My Profile`: testa autenticacao JWT.
- `Delete My Account`: remove a conta logada apos confirmacao.

## Arquitetura (resumo)

- `src/server.js`: bootstrap da aplicacao, `dotenv`, middlewares globais e fallback para `index.html`.
- `src/routes/index.js`: concentracao de rotas da API.
- `src/controllers/*.js`: regras por dominio (`auth`, `users`, `health`).
- `src/middlewares/authMiddleware.js`: validacao do token JWT.
- `src/utils/db.js`: leitura/escrita/garantia do banco JSON.
- `src/utils/jwt.js`: carga opcional da lib JWT e validacao de disponibilidade.

## Formato do banco (`src/db.json`)

```json
{
  "users": [
    {
      "id": "uuid",
      "username": "usuario",
      "passwordHash": "$2b$10$...",
      "createdAt": "2026-03-05T00:00:00.000Z"
    }
  ]
}
```

## Seguranca aplicada

- Senha nunca e salva em texto puro.
- Hash com `bcrypt`.
- Token JWT com expiracao de 1 hora.
- Rota de perfil protegida por middleware de autenticacao.
- Exclusao de conta restrita ao proprio usuario autenticado.

## Melhorias futuras

- Validacao de entrada com Zod ou Joi
- Testes automatizados
- Banco relacional ou NoSQL
- Refresh token para sessao
