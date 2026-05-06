import { Module } from '@nestjs/common';
import { OsrmModule } from './osrm/osrm.module';
import { NominatimModule } from './nominatim/nominatim.module';
import { RoutingModule } from './routing/routing.module';
import { DeliveryModule } from './delivery/delivery.module';
import { RoutingController } from './routing/routing.controller';

@Module({
  imports: [OsrmModule, NominatimModule, RoutingModule, DeliveryModule],
  controllers: [RoutingController],
})
export class AppModule {}
