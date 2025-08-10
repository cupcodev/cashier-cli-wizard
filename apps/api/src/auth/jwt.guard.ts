import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly secret = process.env.JWT_ACCESS_SECRET!;
  constructor(private jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || '';
    const token = (Array.isArray(auth) ? auth[0] : auth).replace(/^Bearer\s+/i,'');
    if (!token) throw new UnauthorizedException('Missing token');
    try {
      const payload = await this.jwt.verifyAsync(token, { secret: this.secret });
      (req as any).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
