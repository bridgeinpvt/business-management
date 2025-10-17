// URL configuration for cross-service communication
export const urls = {
  // Domain configuration - use full URLs in production
  AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL || process.env.AUTH_URL || "http://localhost:3001",
  HUB_URL: process.env.NEXT_PUBLIC_HUB_URL || process.env.HUB_URL || "http://localhost:3000",
  CAPSULE_URL: process.env.NEXT_PUBLIC_CAPSULE_URL || process.env.CAPSULE_URL || "http://localhost:3002",
  BUSINESS_URL: process.env.NEXT_PUBLIC_BUSINESS_URL || process.env.BUSINESS_URL || "http://localhost:3004",

  // Legacy support - extract domain from URL
  AUTH_DOMAIN: process.env.AUTH_DOMAIN || (process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001").replace(/^https?:\/\//, ''),
  HUB_DOMAIN: process.env.HUB_DOMAIN || (process.env.NEXT_PUBLIC_HUB_URL || "http://localhost:3000").replace(/^https?:\/\//, ''),
  CAPSULE_DOMAIN: process.env.CAPSULE_DOMAIN || (process.env.NEXT_PUBLIC_CAPSULE_URL || "http://localhost:3002").replace(/^https?:\/\//, ''),
  BUSINESS_DOMAIN: process.env.BUSINESS_DOMAIN || (process.env.NEXT_PUBLIC_BUSINESS_URL || "http://localhost:3004").replace(/^https?:\/\//, ''),

  // Extract cookie domain (base domain only, without port)
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || (process.env.NEXT_PUBLIC_BUSINESS_URL || "http://localhost:3004").replace(/^https?:\/\//, '').split(':')[0],
} as const;
