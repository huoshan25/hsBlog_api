import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from './response';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(data => {
        if (data instanceof ApiResponse) {
          // 如果已经是 ApiResponse 类型，直接返回
          return data;
        } else {
          // 否则默认为成功响应
          return new ApiResponse(HttpStatus.OK, '操作成功', data);
        }
      }),
    );
  }
}
