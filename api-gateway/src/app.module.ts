import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RoutingModule } from './routing/routing.module';
import { DeliveryModule } from './delivery/delivery.module';
import { DeliveryGateway } from './gateways/delivery.gateway';

@Module({
  imports: [
    RoutingModule,
    DeliveryModule,
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
  providers: [DeliveryGateway],
})
export class AppModule {}
