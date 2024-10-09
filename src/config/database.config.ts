import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'blog',
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING || ['error'],
  entities: ['dist/modules/**/*.entity{.ts,.js}'], // 使用双星号来匹配任意深度的子目录
  poolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 10,
  connectorPackage: 'mysql2',
  extra: {
    authPlugin: 'sha256_password',
  }
}));