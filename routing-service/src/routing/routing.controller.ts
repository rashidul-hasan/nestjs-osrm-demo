import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoutingService } from './routing.service';
import { DeliveryService } from '../delivery/delivery.service';
import { VEHICLE_CONFIGS, VehicleType } from '../config/vehicle.config';

@Controller()
export class RoutingController {
  private readonly logger = new Logger(RoutingController.name);

  constructor(
    private readonly routingService: RoutingService,
    private readonly deliveryService: DeliveryService,
  ) {}

  @MessagePattern('find_route')
  async findRoute(
    @Payload()
    data: {
      origin: { lat: number; lon: number };
      destination: { lat: number; lon: number };
      profile?: string;
      steps?: boolean;
      overview?: string;
    },
  ) {
    this.logger.log(`find_route: ${JSON.stringify(data.origin)} → ${JSON.stringify(data.destination)}`);
    return this.routingService.findRoute(
      data.origin,
      data.destination,
      data.profile || 'driving',
      {
        steps: data.steps !== false,
        overview: data.overview || 'full',
      },
    );
  }

  @MessagePattern('find_nearest')
  async findNearest(
    @Payload() data: { lat: number; lon: number; profile?: string },
  ) {
    this.logger.log(`find_nearest: [${data.lat}, ${data.lon}]`);
    return this.routingService.findNearest(data.lat, data.lon, data.profile || 'driving');
  }

  @MessagePattern('geocode')
  async geocode(@Payload() data: { address: string }) {
    this.logger.log(`geocode: "${data.address}"`);
    return this.routingService.geocode(data.address);
  }

  @MessagePattern('reverse_geocode')
  async reverseGeocode(@Payload() data: { lat: number; lon: number }) {
    this.logger.log(`reverse_geocode: [${data.lat}, ${data.lon}]`);
    return this.routingService.reverseGeocode(data.lat, data.lon);
  }

  @MessagePattern('distance_table')
  async distanceTable(
    @Payload()
    data: { coordinates: Array<{ lat: number; lon: number }>; profile?: string },
  ) {
    this.logger.log(`distance_table: ${data.coordinates.length} points`);
    return this.routingService.getDistanceTable(data.coordinates, data.profile || 'driving');
  }

  @MessagePattern('calculate_delivery')
  async calculateDelivery(
    @Payload()
    data: {
      origin: { lat: number; lon: number };
      destination: { lat: number; lon: number };
      vehicleType: VehicleType;
      currency?: string;
    },
  ) {
    this.logger.log(
      `calculate_delivery: ${data.vehicleType} from ${JSON.stringify(data.origin)} to ${JSON.stringify(data.destination)}`,
    );
    return this.deliveryService.calculateDelivery(
      data.origin,
      data.destination,
      data.vehicleType,
      data.currency || 'BDT',
    );
  }

  @MessagePattern('compare_vehicles')
  async compareVehicles(
    @Payload()
    data: { origin: { lat: number; lon: number }; destination: { lat: number; lon: number } },
  ) {
    this.logger.log(`compare_vehicles: ${JSON.stringify(data.origin)} → ${JSON.stringify(data.destination)}`);
    return this.deliveryService.compareAllVehicles(data.origin, data.destination);
  }

  @MessagePattern('get_vehicle_types')
  getVehicleTypes() {
    this.logger.log('get_vehicle_types');
    return Object.values(VEHICLE_CONFIGS);
  }
}
