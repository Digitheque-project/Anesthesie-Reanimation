import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ token: string; user: Partial<User> }> {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Cet email est déjà utilisé');

    const user = this.userRepo.create(dto);
    const saved = await this.userRepo.save(user);
    const userResult = Array.isArray(saved) ? saved[0] : saved;
    return this.generateToken(userResult);
  }

  async login(dto: LoginDto): Promise<{ token: string; user: Partial<User> }> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'nom', 'email', 'role', 'motDePasse', 'createdAt'],
    });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const isPasswordValid = await bcrypt.compare(dto.motDePasse, user.motDePasse);
    if (!isPasswordValid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    return this.generateToken(user);
  }

  private generateToken(user: User): { token: string; user: Partial<User> } {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const { motDePasse, ...userResult } = user as any;
    return { token: this.jwtService.sign(payload), user: userResult };
  }

  async validateUser(id: string): Promise<User | null> {
    try { return await this.userRepo.findOne({ where: { id } }); }
    catch { return null; }
  }
}
