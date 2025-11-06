import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().startsWith('re_'),
  MAILPIT_SMTP_HOST: z.string().default('localhost'),
  MAILPIT_SMTP_PORT: z.coerce.number().default(1025),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info'),
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
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
