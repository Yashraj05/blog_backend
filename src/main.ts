import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    cors({
      origin: '*', // You can specify the origin or origins that are allowed to access your API
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // HTTP methods allowed
      credentials: true, // Enable credentials (e.g., cookies) for cross-origin requests
    }),
  );
  await app.listen(3000);
}
bootstrap();
