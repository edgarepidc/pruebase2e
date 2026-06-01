# Tablero E2E QA (pruebase2e)

App **solo** para el tablero de pruebas E2E ADO-EMBUS. No incluye PMO, proyectos ni otros módulos.

Repo: [github.com/edgarepidc/pruebase2e](https://github.com/edgarepidc/pruebase2e)

## Stack

- Next.js 16 + TypeScript + Tailwind
- Supabase Auth (login)
- PostgreSQL (Prisma) — mismo proyecto Supabase que configures

## Despliegue rápido

1. **Supabase:** crea proyecto, copia API keys y `DATABASE_URL` (pooler 6543 para Vercel).
2. **GitHub:** push de este repo a `pruebase2e`.
3. **Vercel:** importa el repo, añade variables de `.env.example`, deploy.
4. **Auth URLs** en Supabase con tu URL `https://….vercel.app`.
5. **Migraciones:** `npx prisma migrate deploy` (o GitHub Action `Database migrate` con secreto `DATABASE_URL` en 5432).
6. **Datos:** `npm run prisma:seed` (279 pruebas + tenant EMBUS).
7. Crea usuario en Supabase Auth (Authentication → Users) con email/contraseña.
8. Entra en `/login` → `/dashboard`.

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/login` | Acceso editores |
| `/dashboard` | Tablero completo |
| `/public/e2e/[token]` | Solo lectura (enlace generado en el tablero) |

## Variables opcionales

- `ALLOWED_EDIT_EMAILS` — si se define, solo esos emails pueden editar.
- `DEFAULT_TENANT_SLUG` — slug del tenant en seed (default `embus`).

## Local

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

Abre http://localhost:3000
