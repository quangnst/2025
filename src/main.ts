import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors) => {
        console.log('validationErrors', validationErrors);
        return new UnprocessableEntityException(
          validationErrors.map((error) => ({
            field: error.property,
            errors: Object.values(error.constraints).join(', '),
          })),
        );
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
