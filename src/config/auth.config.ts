/*身份验证配置*/
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: '30m',
  refreshSecret: process.env.REFRESH_SECRET || 'your-refresh-secret-key',
  refreshExpiresIn: '7d',
  /*白名单*/
  whiteList: ['/admin/user/login', '/admin/user/register', '/admin/user/refresh-token'],
  /*不需要验证的路径前缀*/
  publicPrefixes: ['/blog'],
  /*需要验证的路径前缀*/
  protectedPrefixes: ['/admin'],
  /*特殊情况：需要验证的路径前缀中的例外*/
  exceptions: ['/admin/public-info'],
};