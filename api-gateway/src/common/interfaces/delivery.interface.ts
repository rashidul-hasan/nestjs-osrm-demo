import { Coordinate } from './coordinate.interface';
import { RouteResult } from './route.interface';
import { VehicleType, VehicleTypeInfo } from './vehicle.interface';

export interface DeliveryFee {
  baseFee: number;
  distanceFee: number;
  timeFee: number;
  totalFee: number;
  currency: string;
}

export interface DeliveryEstimate {
  vehicleType: VehicleType;
  vehicleInfo: VehicleTypeInfo;
  origin: Coordinate;
  destination: Coordinate;
  route: RouteResult;
  adjustedDurationSeconds: number;
  adjustedDurationMinutes: number;
  deliveryFee: DeliveryFee;
  estimatedPickupTime: string;
  estimatedArrivalTime: string;
}
