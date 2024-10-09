import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseInterface<T> {
  code: number;
  data: T;
  message: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseInterface<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseInterface<T>> {
    return next.handle().pipe(
      map(data => {
        const message = data.code === HttpStatus.OK ? '请求成功！' : data.message || '请求失败！';
        const response = context.switchToHttp().getResponse();
        return {
          code: data.code || response.statusCode,
          data: data.data,
          message
        };
      }),
    );
  }
}