# Gamers Community - Full Stack Simples com Node.js

Este projeto e uma aplicacao full stack simples feita com:

- Node.js
- Express
- JSON como banco de dados local
- bcrypt para hash de senha
- nodemon para desenvolvimento

O objetivo e demonstrar um fluxo completo de cadastro e login conectando front-end e back-end.

## Funcionalidades

- Status da API na tela
- Cadastro de usuario
- Login de usuario
- Listagem de usuarios cadastrados
- Persistencia local em `db.json`
- Senhas protegidas com `bcrypt`
- Autenticacao com JWT
- Rota protegida por token (`GET /api/profile`)

## Estrutura do projeto

- `server.js`: servidor Express, rotas da API e regras de negocio
- `index.html`: interface da aplicacao
- `style.css`: estilos da interface
- `script.js`: logica do front-end e consumo da API
- `db.json`: "banco de dados" em arquivo JSON
- `package.json`: scripts e dependencias

## Como executar

1. Instale dependencias:

```bash
npm install
```

2. Rode em desenvolvimento (com recarga automatica):

```bash
npm run dev
```

3. Abra no navegador:

```text
http://localhost:3000
```

Para rodar sem nodemon:

```bash
npm start
```

## Back-end (`server.js`)

### 1) Configuracao inicial

- `express.json()` permite receber JSON no body das requisicoes.
- `express.static(__dirname)` publica os arquivos do front (`index.html`, `style.css`, `script.js`).
- `PORT` usa variavel de ambiente ou `3000`.

### 2) Banco JSON

O projeto usa o arquivo `db.json` para armazenar usuarios.

- `ensureDb()`: cria `db.json` com `{ users: [] }` caso nao exista.
- `readDb()`: le e converte o JSON para objeto JavaScript.
- `writeDb(data)`: salva o objeto atualizado no arquivo.

### 3) Rotas da API

- `GET /api/health`
  - Retorna se o servidor esta ativo.
- `GET /api/users`
  - Retorna usuarios sem expor `passwordHash`.
- `POST /api/register`
  - Recebe `username` e `password`.
  - Valida campos obrigatorios.
  - Exige senha com minimo de 6 caracteres.
  - Impede usernames duplicados (ignorando maiusculas/minusculas).
  - Gera hash com `bcrypt.hash(password, 10)`.
  - Salva no `db.json`.
- `POST /api/login`
  - Busca usuario por `username`.
  - Valida senha com `bcrypt.compare`.
  - Em caso de sucesso, retorna um JWT para autenticacao.
- `GET /api/profile` (protegida)
  - Exige header `Authorization: Bearer <token>`.
  - Retorna dados do usuario autenticado.

### 4) Fallback de rota

- `app.use((req, res) => res.sendFile(...index.html))`
  - Qualquer rota nao tratada pela API devolve a pagina principal.

## Front-end (`script.js`)

O front consome a API usando `fetch`:

- `requestJson(url, options)`: funcao reutilizavel para requisicoes HTTP.
- `loadHealth()`: chama `GET /api/health` e atualiza o status da API.
- `loadUsers()`: chama `GET /api/users` e desenha a lista de usuarios.
- Submit do formulario de cadastro:
  - chama `POST /api/register`.
- Submit do formulario de login:
  - chama `POST /api/login`.

Tambem ha mensagens visuais de sucesso/erro para orientar o usuario.

## Seguranca aplicada

- Senha nao e armazenada em texto puro.
- O campo salvo no banco e `passwordHash` (hash bcrypt).
- No login, a senha digitada e comparada com o hash via `bcrypt.compare`.
- O token JWT expira em 1 hora.
- Rotas protegidas validam token com assinatura secreta.

## Exemplo do formato no `db.json`

```json
{
  "users": [
    {
      "id": "uuid",
      "username": "usuario",
      "passwordHash": "$2b$10$...",
      "createdAt": "2026-03-04T22:51:02.987Z"
    }
  ]
}
```

## Possiveis melhorias

- Validacao mais robusta (ex.: Zod/Joi)
- Banco de dados real (PostgreSQL/MongoDB)
- Testes automatizados
