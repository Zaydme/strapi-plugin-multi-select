// Test-only secrets
module.exports = ({ env }) => ({
  autoOpen: false,
  // The tests sign in more often than the default limit allows
  rateLimit: {
    enabled: false,
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'e2e-admin-jwt-secret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'e2e-api-token-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'e2e-transfer-token-salt'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY', 'e2e-encryption-key'),
  },
  flags: {
    nps: false,
    promoteEE: false,
  },
});
