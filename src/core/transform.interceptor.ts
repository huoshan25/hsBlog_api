import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StreamableFile } from '@nestjs/common';

export interface ResponseInterface<T> {
  code: number;
  data: T;
  message: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseInterface<T>> {
  intercept(context: ExecutionContext, next: CallHandler) {
    // 获取响应对象
    const response = context.switchToHttp().getResponse();

    // 检查是否是流式响应
    const isStreamResponse = response.getHeader('Content-Type')?.includes('text/event-stream') ?? false;

    // 如果是流式响应，直接返回，不进行转换
    if (isStreamResponse) {
      return next.handle();
    }

    // 对普通响应进行转换
    return next.handle().pipe(
      map(data => {
        const message = data.message || '请求成功！';
        return {
          code: data.code || response.statusCode,
          data: data.data,
          message
        };
      }),
    );
  }
}