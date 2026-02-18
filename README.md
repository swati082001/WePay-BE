# WePay-BE

Enterprise-level NestJS backend API for WePay.

## Tech Stack

- **NestJS 10** – Node.js framework
- **MongoDB + Mongoose** – Document database and ODM
- **Passport + JWT** – Authentication
- **class-validator / class-transformer** – DTO validation
- **Swagger** – API documentation
- **@nestjs/terminus** – Health checks
- **@nestjs/throttler** – Rate limiting

## Project Structure

```
src/
├── main.ts                 # Bootstrap, global prefix, validation, Swagger, CORS
├── app.module.ts           # Root module, global guards (JWT, Throttler)
├── config/
│   ├── config.schema.ts    # Joi env validation
│   └── index.ts
├── common/
│   ├── decorators/         # @Public(), @CurrentUser()
│   ├── filters/            # AllExceptionsFilter
│   ├── guards/             # JwtAuthGuard
│   ├── interceptors/       # TransformInterceptor
│   ├── interfaces/         # ApiResponse
│   └── pipes/              # ParseObjectIdPipe, ParseUuidPipe
├── database/
│   └── database.module.ts  # Mongoose async config
├── health/
│   ├── health.module.ts
│   └── health.controller.ts  # /health (MongoDB ping)
└── modules/
    ├── auth/
    │   ├── dto/            # LoginDto, RegisterDto
    │   ├── strategies/     # JwtStrategy
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   └── auth.module.ts
    └── users/
        ├── dto/            # CreateUserDto, UpdateUserDto
        ├── schemas/         # User (Mongoose schema)
        ├── users.controller.ts
        ├── users.service.ts
        └── users.module.ts
```

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` (or `.env.local`) and set:

   - `MONGO_URI` – MongoDB connection string (e.g. `mongodb://localhost:27017/wepay`)
   - `JWT_SECRET` – at least 32 characters

3. **Database**

   Ensure MongoDB is running. No migrations needed; Mongoose creates collections on first use.

4. **Run**

   ```bash
   npm run start:dev
   ```

   - API: `http://localhost:3000/api/v1`
   - Swagger: `http://localhost:3000/api/docs`

## Scripts

| Script           | Description                |
|-----------------|----------------------------|
| `npm run start` | Start app                  |
| `npm run start:dev` | Start with watch       |
| `npm run build` | Build for production       |
| `npm run start:prod` | Run built app          |
| `npm run lint`  | Lint and fix               |
| `npm run test`  | Unit tests                 |
| `npm run test:e2e` | E2E tests              |

## API Overview

- **Auth** (public): `POST /auth/register`, `POST /auth/login`
- **Users** (JWT): `GET /users/me`, `GET /users/:id`, `PATCH /users/:id`
- **Health** (public): `GET /health`

All protected routes require `Authorization: Bearer <token>`. User IDs are MongoDB ObjectIds (24-char hex).

## License

UNLICENSED
