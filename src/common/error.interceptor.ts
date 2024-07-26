import { Injectable, NestInterceptor, ExecutionContext, HttpStatus, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpException } from '@nestjs/common/exceptions';

import { ApiResponse } from './response';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        // 处理特定异常类型
        if (error instanceof HttpException) {
          const httpException: HttpException = error;
          const response = httpException.getResponse();
          const message = response['message'] || response;
          const code = httpException.getStatus();
          return throwError(new HttpException(
            new ApiResponse(code, message.toString()),
            code)
          );
        }

        // 处理其他异常
        return throwError(new HttpException(
          new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, '服务器内部错误'),
          HttpStatus.INTERNAL_SERVER_ERROR)
        );
      }),
    );
  }
}
