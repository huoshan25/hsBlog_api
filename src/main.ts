import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CategoryService } from "./modules/category/service/category.service";
import { CustomHttpExceptionFilter } from './core/error.interceptor';
import { TransformInterceptor } from './core/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 注入CategoriesService并调用seedDefaultCategories方法
  const categoriesService = app.get(CategoryService);
  await categoriesService.seedDefaultCategories();
  /*全局验证管道：*/
  app.useGlobalPipes(new ValidationPipe());
  /**把自定义过滤器应用为全局过滤器*/
  app.useGlobalFilters(new CustomHttpExceptionFilter());
  /*统一响应*/
  app.useGlobalInterceptors(new TransformInterceptor());
  /**全局允许跨域*/
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    exposedHeaders: 'Content-Disposition',
    credentials: true,
  });
  app.setGlobalPrefix('api');

  await app.listen(9001);
}
bootstrap()
