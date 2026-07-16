import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet.default());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://ton-frontend.onrender.com',
      'https://blocbackfront.onrender.com',
      'https://chu-bloc-backend.onrender.com',
      'https://anesthesie-reanimation.onrender.com',
    ],
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
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // ✅ Swagger accessible à /bloc/api/docs
  SwaggerModule.setup('bloc/api/docs', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`🚀 Backend démarré sur le port ${port}`);
}
bootstrap();
 
