import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type JwtPayload = { sub: string; email: string };

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | string => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;
    if (data && user) {
      return user[data];
    }
    return user;
  },
);
