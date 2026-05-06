import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { RoutingModule } from '../routing/routing.module';

@Module({
  imports: [RoutingModule],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
