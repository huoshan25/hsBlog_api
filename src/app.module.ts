import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Article } from "./modules/article/entities/article.entity";
import { CategoryModule } from './modules/category/category.module';
import { ArticleModule } from './modules/article/article.module'
import { Category } from "./modules/category/entities/category.entity";
import { ErrorInterceptor } from "./common/error.interceptor";
import { ResponseInterceptor } from './common/response.interceptor';
import { OssModule } from './modules/oss/oss.module';
import { Tag } from './modules/article/entities/tag.entity';
import { AuthMiddleware } from './middleware/auth.middleware';
import { authConfig } from './config/auth.config';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "123456",
      database: "blog",
      synchronize: true,
      logging: true,
      entities: [User, Article, Category, Tag],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugin: 'sha256_password',
      }
    }),
    JwtModule.register({
      /**声明为全局模块*/
      global: true,
      secret: authConfig.jwtSecret,
      signOptions: { expiresIn: authConfig.jwtExpiresIn },
    }),
    CategoryModule,
    ArticleModule,
    OssModule,
  ],
  controllers: [AppController],
  providers: [AppService, ErrorInterceptor, ResponseInterceptor, AuthMiddleware],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');  // 将中间件应用到所有路由
  }
}
