/*身份验证配置*/
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: '1h',
  refreshSecret: process.env.REFRESH_SECRET || 'your-refresh-secret-key',
  refreshExpiresIn: '7d',
  /*白名单*/
  whiteList: ['/user/login', '/user/register', '/user/refresh-token'],
};