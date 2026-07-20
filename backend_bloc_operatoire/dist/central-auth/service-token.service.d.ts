import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class ServiceTokenService {
    private readonly jwt;
    private readonly config;
    constructor(jwt: JwtService, config: ConfigService);
    mint(): string;
}
