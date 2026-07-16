import { registerAs } from '@nestjs/config';

export default registerAs('centralAuth', () => ({
  jwtSecret: process.env.CENTRAL_AUTH_JWT_SECRET,
  authServiceUrl: process.env.CENTRAL_AUTH_SERVICE_URL,
  userServiceUrl: process.env.CENTRAL_USER_SERVICE_URL,
  serviceRegistryUrl: process.env.CENTRAL_SERVICE_REGISTRY_URL,
  chuServiceUrl: process.env.CENTRAL_CHU_SERVICE_URL,
  loginUrl: process.env.CENTRAL_LOGIN_URL,
}));
