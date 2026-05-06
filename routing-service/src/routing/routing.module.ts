import { Module } from '@nestjs/common';
import { RoutingService } from './routing.service';
import { OsrmModule } from '../osrm/osrm.module';
import { NominatimModule } from '../nominatim/nominatim.module';

@Module({
  imports: [OsrmModule, NominatimModule],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
