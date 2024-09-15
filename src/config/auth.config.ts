export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: '1h',
  refreshSecret: process.env.REFRESH_SECRET || 'your-refresh-secret-key',
  refreshExpiresIn: '7d',
};