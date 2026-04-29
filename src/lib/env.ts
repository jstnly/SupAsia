/**
 * Validates required environment variables at module load time.
 * Import this in server-side code to catch misconfiguration early.
 * Client-side NEXT_PUBLIC_ vars are validated separately below.
 */

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "DATABASE_URL",
] as const;

const optional = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_TTS_API_KEY",
  "ANTHROPIC_API_KEY",
  "GROQ_API_KEY",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
] as const;

export function validateEnv(): void {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        `Copy .env.local.example to .env.local and fill in the values.`
    );
  }

  // Warn (not throw) for optional but recommended vars
  const missingOptional = optional.filter((k) => !process.env[k]);
  if (missingOptional.length > 0 && process.env.NODE_ENV === "production") {
    console.warn(
      `[env] Optional env vars not set (features will be degraded): ${missingOptional.join(", ")}`
    );
  }
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  databaseUrl: process.env.DATABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  googleTtsKey: process.env.GOOGLE_TTS_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  vapidSubject: process.env.VAPID_SUBJECT,
} as const;
