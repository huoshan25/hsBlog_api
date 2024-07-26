import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class CustomHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    console.log(exceptionResponse,'exceptionResponse');
    // 定义一个自定义的错误响应结构
    const customResponse = {
      code: status,
      message: exceptionResponse.message || exception.message,
      errors: exceptionResponse.error || null,
    };

    response.status(status).json(customResponse);
  }
}
