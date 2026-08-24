const placeholders = ["PROJECT_REF", "PASSWORD", "REGION", "YOUR_"];

function isUsableDatabaseUrl(value: string | undefined) {
  return Boolean(
    value &&
    (value.startsWith("postgres://") || value.startsWith("postgresql://")) &&
    !placeholders.some((placeholder) => value.includes(placeholder)),
  );
}

export function isDatabaseConfigured() {
  return isUsableDatabaseUrl(process.env.DATABASE_URL);
}

export function isSupabaseBrowserConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url?.startsWith("https://") && key && !url.includes("PROJECT_REF") && !key.includes("YOUR_"));
}
