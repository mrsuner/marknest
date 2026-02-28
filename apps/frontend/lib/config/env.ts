/**
 * Environment configuration with fallbacks
 */
export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const

/**
 * Validate required environment variables
 */
export function validateEnv() {
  const requiredEnvVars = {
    NEXT_PUBLIC_API_BASE_URL: env.API_BASE_URL,
  }

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missingVars.join(', ')}`
    )
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
  }
}