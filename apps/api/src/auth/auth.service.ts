import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

type User = { id: string; email: string; name: string; role: 'super_admin'|'finance'|'support'|'client'; passwordHash: string };

@Injectable()
export class AuthService {
  // DEMO: usuários em memória (na próxima fase, Postgres + migrations + 2FA)
  private users: User[] = [
    {
      id: 'u1',
      email: 'lauroroger@cupcode.com.br',
      name: 'Lauro Roger',
      role: 'super_admin',
      // senha: Temp#Cupcode2025
      passwordHash: bcrypt.hashSync('Temp#Cupcode2025', 10),
    },
    {
      id: 'u2',
      email: 'dev@cupcode.com.br',
      name: 'Dev Cupcode',
      role: 'super_admin',
      // senha: Dev#Cupcode2025
      passwordHash: bcrypt.hashSync('Dev#Cupcode2025', 10),
    },
  ];

  constructor(private jwt: JwtService) {}

  async validate(email: string, password: string) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return user;
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: '2h' });
    return { accessToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }
}
