import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CategoryService } from "./category/category.service";
import { CustomHttpExceptionFilter } from './common/error2.interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 注入CategoriesService并调用seedDefaultCategories方法
  const categoriesService = app.get(CategoryService);
  await categoriesService.seedDefaultCategories();

  /**把自定义过滤器应用为全局过滤器*/
  app.useGlobalFilters(new CustomHttpExceptionFilter());
  /**全局允许跨域*/
  app.enableCors()
  await app.listen(9000);
}
bootstrap();
