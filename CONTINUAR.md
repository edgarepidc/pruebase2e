# Continuar: conectar el Supabase correcto

## Problema actual

Vercel usa el proyecto **`qsgzktdhtnkxypevhqoi`** (Auth con `diazcruzee@gmail.com` y otros).

Si en tu panel Supabase solo ves **`santiagocruz891010@gmail.com`**, estás en **otro** proyecto → el login de ese usuario no funcionará hasta alinear claves.

Comprueba en login: línea **Proyecto Auth: …** debe ser igual al **Reference ID** de tu panel.

---

## Pasos (una vez)

### 1. Archivo `.env` local

En la carpeta `pruebase2e`, crea `.env` con el Supabase donde está tu usuario:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true
NEXT_PUBLIC_APP_URL=https://pruebase2e.vercel.app
```

(`TU_REF` = Reference ID del panel, sin `/auth/v1`)

### 2. Subir a Vercel

```bash
cd pruebase2e
node scripts/sync-vercel-env.mjs
npx vercel deploy --prod
```

### 3. Base de datos del proyecto nuevo

```bash
npx prisma migrate deploy
npm run prisma:seed
```

### 4. Auth en Supabase (proyecto nuevo)

**Authentication → URL Configuration**

- Site URL: `https://pruebase2e.vercel.app`
- Redirect URLs: `https://pruebase2e.vercel.app/**`

### 5. Probar

1. https://pruebase2e.vercel.app/logout  
2. Incógnito → `/login`  
3. Email `santiagocruz891010@gmail.com` + contraseña del usuario creado en **ese** proyecto

---

## Cerrar sesión vieja

- https://pruebase2e.vercel.app/logout  
- Botón **Cerrar sesión** en el tablero
