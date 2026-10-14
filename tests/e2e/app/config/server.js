module.exports = ({ env }) => ({
  host: env('HOST', '127.0.0.1'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', ['e2e-app-key-1', 'e2e-app-key-2']),
  },
});
