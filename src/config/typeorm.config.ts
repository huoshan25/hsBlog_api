import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

const envPath = process.env.NODE_ENV === 'production'
  ? path.resolve(process.cwd(), '.env.production')
  : path.resolve(process.cwd(), '.env');


// 加载环境变量
config({ path: envPath });

// 添加调试日志
console.log('Environment:', process.env.NODE_ENV);
console.log('Database Config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  database: process.env.DB_NAME
});

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'blog',
  entities: ['dist/modules/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
  poolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 10,
  connectorPackage: 'mysql2',
  extra: {
    authPlugin: 'sha256_password',
  }
});