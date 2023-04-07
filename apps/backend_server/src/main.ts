import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import secureSession from '@fastify/secure-session';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
    }),
    { bufferLogs: true },
  );

  await app.register(fastifyCookie, {
    secret: config.COOKIE_SECRET, // for cookies signature
  });

  await app.register(secureSession, {
    secret: config.SESSION_SECRET,
    salt: 'mq9hDxBVDbspDR6n',
  });

  await app.listen(3000);
}
bootstrap();
