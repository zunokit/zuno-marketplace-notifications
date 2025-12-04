import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().startsWith('re_'),
  REDIS_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info'),
  MAILPIT_SMTP_HOST: z.string().default('localhost'),
  MAILPIT_SMTP_PORT: z.coerce.number().default(1025),
  ENABLE_WEBSOCKET: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  ENABLE_PUSH: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  ENABLE_SMS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  API_KEYS: z
    .string()
    .transform((val) => val ? val.split(',').map((k) => k.trim()).filter(Boolean) : [])
    .default(''),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  // Skip strict validation in CI builds if SKIP_ENV_VALIDATION is set
  // This allows builds to proceed with dummy environment variables
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    // Use safeParse to allow builds with invalid/missing env vars
    const result = envSchema.safeParse(process.env)
    if (result.success) {
      return result.data
    }
    // Return env vars as-is if validation fails (CI build only)
    return process.env as unknown as Env
  }

  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('\n')
      throw new Error(`❌ Invalid environment variables:\n${missingVars}`)
    }
    throw error
  }
}

export const env = validateEnv()
