import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RoutingController } from './routing.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ROUTING_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ROUTING_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.ROUTING_SERVICE_PORT || '3001'),
        },
      },
    ]),
  ],
  controllers: [RoutingController],
  exports: [ClientsModule],
})
export class RoutingModule {}
