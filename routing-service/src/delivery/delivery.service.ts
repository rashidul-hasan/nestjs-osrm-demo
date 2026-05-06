import { Injectable, Logger } from '@nestjs/common';
import { RoutingService, Coordinate, RouteResult } from '../routing/routing.service';
import { VEHICLE_CONFIGS, VehicleType, VehicleConfig } from '../config/vehicle.config';

export interface DeliveryFee {
  baseFee: number;
  distanceFee: number;
  timeFee: number;
  subtotal: number;
  surgeMultiplier: number;
  totalFee: number;
  currency: string;
  breakdown: string;
}

export interface DeliveryEstimate {
  vehicleType: VehicleType;
  vehicleInfo: VehicleConfig;
  origin: Coordinate;
  destination: Coordinate;
  route: RouteResult;
  adjustedDurationSeconds: number;
  adjustedDurationMinutes: number;
  deliveryFee: DeliveryFee;
  estimatedPickupTime: string;
  estimatedArrivalTime: string;
  warnings: string[];
}

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(private readonly routingService: RoutingService) {}

  async calculateDelivery(
    origin: Coordinate,
    destination: Coordinate,
    vehicleType: VehicleType,
    currency: string = 'BDT',
  ): Promise<DeliveryEstimate> {
    const config = VEHICLE_CONFIGS[vehicleType];
    if (!config) {
      throw new Error(`Unknown vehicle type: ${vehicleType}`);
    }

    // Get route using the vehicle's OSRM profile
    const route = await this.routingService.findRoute(
      origin,
      destination,
      config.profile,
    );

    // Adjust duration based on vehicle speed multiplier
    const adjustedDurationSeconds = Math.round(
      route.duration_seconds * config.speedMultiplier,
    );
    const adjustedDurationMinutes = parseFloat((adjustedDurationSeconds / 60).toFixed(1));

    // Calculate fee
    const deliveryFee = this.calculateFee(
      route.distance_km,
      adjustedDurationMinutes,
      config,
      currency,
    );

    // Calculate estimated times
    const now = new Date();
    const pickupMinutes = 5; // 5 min to reach pickup
    const estimatedPickupTime = new Date(now.getTime() + pickupMinutes * 60000).toISOString();
    const estimatedArrivalTime = new Date(
      now.getTime() + (pickupMinutes + adjustedDurationMinutes) * 60000,
    ).toISOString();

    // Generate warnings
    const warnings: string[] = [];
    if (route.distance_km > config.maxRecommendedKm) {
      warnings.push(
        `Distance (${route.distance_km} km) exceeds recommended max for ${config.name} (${config.maxRecommendedKm} km)`,
      );
    }
    if (vehicleType === VehicleType.BICYCLE && route.distance_km > 5) {
      warnings.push('Long distance bicycle delivery may take significantly longer');
    }

    return {
      vehicleType,
      vehicleInfo: config,
      origin,
      destination,
      route,
      adjustedDurationSeconds,
      adjustedDurationMinutes,
      deliveryFee,
      estimatedPickupTime,
      estimatedArrivalTime,
      warnings,
    };
  }

  async compareAllVehicles(
    origin: Coordinate,
    destination: Coordinate,
    currency: string = 'BDT',
  ): Promise<DeliveryEstimate[]> {
    const vehicleTypes = Object.values(VehicleType);
    const results = await Promise.allSettled(
      vehicleTypes.map((vt) =>
        this.calculateDelivery(origin, destination, vt, currency),
      ),
    );

    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<DeliveryEstimate>).value)
      .sort((a, b) => a.deliveryFee.totalFee - b.deliveryFee.totalFee);
  }

  private calculateFee(
    distanceKm: number,
    durationMinutes: number,
    config: VehicleConfig,
    currency: string,
  ): DeliveryFee {
    const baseFee = config.baseFee;
    const distanceFee = parseFloat((distanceKm * config.perKmFee).toFixed(2));
    const timeFee = parseFloat((durationMinutes * config.perMinuteFee).toFixed(2));
    const subtotal = parseFloat((baseFee + distanceFee + timeFee).toFixed(2));

    // Apply surge multiplier for long distances or very short distances
    let surgeMultiplier = 1.0;
    if (distanceKm > 20) surgeMultiplier = 1.2;
    else if (distanceKm < 1) surgeMultiplier = 1.1; // short trip surcharge

    const totalFee = parseFloat((subtotal * surgeMultiplier).toFixed(2));

    const breakdown = [
      `Base: ${currency} ${baseFee}`,
      `Distance: ${distanceKm} km × ${currency} ${config.perKmFee} = ${currency} ${distanceFee}`,
      `Time: ${durationMinutes} min × ${currency} ${config.perMinuteFee} = ${currency} ${timeFee}`,
      surgeMultiplier > 1.0 ? `Surge: ×${surgeMultiplier}` : null,
      `Total: ${currency} ${totalFee}`,
    ]
      .filter(Boolean)
      .join(' | ');

    return {
      baseFee,
      distanceFee,
      timeFee,
      subtotal,
      surgeMultiplier,
      totalFee,
      currency,
      breakdown,
    };
  }
}
