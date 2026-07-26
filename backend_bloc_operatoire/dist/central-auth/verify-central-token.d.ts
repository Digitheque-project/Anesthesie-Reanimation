import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CentralUser } from './central-user.interface';
export declare class NoServiceAccessError extends Error {
}
export type VerifyCentralTokenOptions = {
    permissionRepli?: string;
};
export declare function verifyCentralToken(token: string, jwtService: JwtService, config: ConfigService, options?: VerifyCentralTokenOptions): Promise<CentralUser>;
