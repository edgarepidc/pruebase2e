/**
 * Copia variables de .env local a Vercel Production.
 *
 * Uso:
 *   1. Crea .env en la raíz de pruebase2e con las claves del Supabase CORRECTO
 *   2. node scripts/sync-vercel-env.mjs
 *   3. npx vercel deploy --prod
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}

const env = {
  ...loadEnv(join(root, ".env")),
  ...loadEnv(join(root, ".env.local")),
};

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
];

const vars = {
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL: env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL || "https://pruebase2e.vercel.app",
};

const missing = required.filter((k) => !vars[k]?.trim());
if (missing.length) {
  console.error("Faltan en .env o .env.local:", missing.join(", "));
  process.exit(1);
}

const url = vars.NEXT_PUBLIC_SUPABASE_URL.trim();
if (!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/i.test(url)) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL debe ser solo https://REF.supabase.co (sin /auth/v1)",
  );
  process.exit(1);
}

const ref = new URL(url).hostname.split(".")[0];
console.log("Supabase ref:", ref);
console.log("App URL:", vars.NEXT_PUBLIC_APP_URL);

function add(name, value) {
  try {
    execSync(`npx vercel env rm ${name} production --yes`, {
      cwd: root,
      stdio: "pipe",
    });
  } catch {}
  execSync(`npx vercel env add ${name} production --force`, {
    cwd: root,
    input: Buffer.from(value, "utf8"),
    stdio: ["pipe", "inherit", "inherit"],
  });
}

for (const [name, value] of Object.entries(vars)) {
  if (!value) continue;
  console.log("→", name);
  add(name, value);
}

console.log("\nListo. Ejecuta: npx vercel deploy --prod");
