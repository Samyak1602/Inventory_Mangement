import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow Private Network Access (fix for Chrome loopback space blocking)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Private-Network', 'true');
    next();
  });

  // Enable CORS
  app.enableCors({
    origin: '*', // Automatically bypass strict origin check due to tunnel testing (or keep arrays)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders:
      'Content-Type, Authorization, Accept, Access-Control-Allow-Private-Network',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
