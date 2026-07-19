import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class CentralAuthGuard implements CanActivate {
    private reflector;
    private jwtService;
    private config;
    private readonly logger;
    constructor(reflector: Reflector, jwtService: JwtService, config: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractToken;
}
