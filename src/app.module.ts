import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CategoryModule } from './modules/category/category.module';
import { ArticleModule } from './modules/article/article.module';
import { OssModule } from './modules/oss/oss.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { authConfig } from './config/auth.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TagModule } from './modules/tag/tag.module';
import databaseConfig from './config/database.config';
import { LimModule } from './modules/lim/lim.module';
import { TtsModule } from './modules/tts/tts.module';
import { ProfileModule } from './modules/profile/profile.module';
import { UrlPreviewModule } from './modules/url-preview/url-preview.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 使 ConfigModule 在全局可用
      envFilePath: `.env.${process.env.NODE_ENV}`, // 指定 .env 文件的路径
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
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
    UserModule,
    TagModule,
    LimModule,
    TtsModule,
    ProfileModule,
    UrlPreviewModule
  ],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');  // 将中间件应用到所有路由
  }
}
