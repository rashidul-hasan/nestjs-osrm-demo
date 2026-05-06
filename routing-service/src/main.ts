import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '3001'),
    },
  });

  await app.listen();

  const osrmUrl = process.env.OSRM_URL || 'http://localhost:5000';
  const nominatimUrl = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org';

  console.log(`
╔══════════════════════════════════════════════════╗
║       🗺️  Routing Microservice is running!        ║
║  TCP Port:  ${process.env.PORT || 3001}                              ║
║  OSRM:      ${osrmUrl}           ║
║  Nominatim: ${nominatimUrl}  ║
╚══════════════════════════════════════════════════╝
  `);
}
bootstrap();
