import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { CORS_ORIGINS } from './config/cors-origins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet.default());
  app.enableCors({
    origin: CORS_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ NOUVEAU PRÉFIXE GLOBAL : /bloc/api
  app.setGlobalPrefix('bloc/api');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('CHU Bloc Opératoire API')
    .setDescription('API de gestion du Bloc Opératoire')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // ✅ Swagger accessible à /bloc/api/docs
  SwaggerModule.setup('bloc/api/docs', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`🚀 Backend démarré sur le port ${port}`);
}
bootstrap();
