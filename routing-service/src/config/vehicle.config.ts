export enum VehicleType {
  CAR = 'car',
  MOTORBIKE = 'motorbike',
  BICYCLE = 'bicycle',
  SCOOTER = 'scooter',
  TRUCK = 'truck',
}

export enum OsrmProfile {
  DRIVING = 'driving',
  CYCLING = 'cycling',
  WALKING = 'walking',
}

export interface VehicleConfig {
  type: VehicleType;
  name: string;
  profile: OsrmProfile;
  /**
   * Multiplier applied to OSRM's duration estimate.
   * < 1.0 means faster than OSRM estimate (e.g. motorbikes in traffic)
   * > 1.0 means slower (e.g. trucks navigating carefully)
   */
  speedMultiplier: number;
  /** Fixed base fee regardless of distance/time */
  baseFee: number;
  /** Fee per kilometer */
  perKmFee: number;
  /** Fee per minute of travel */
  perMinuteFee: number;
  /** Emoji icon */
  icon: string;
  /** Human-readable description */
  description: string;
  /** Maximum recommended distance in km */
  maxRecommendedKm: number;
}

export const VEHICLE_CONFIGS: Record<VehicleType, VehicleConfig> = {
  [VehicleType.CAR]: {
    type: VehicleType.CAR,
    name: 'Car',
    profile: OsrmProfile.DRIVING,
    speedMultiplier: 1.0,
    baseFee: 50,
    perKmFee: 15,
    perMinuteFee: 2,
    icon: '🚗',
    description: 'Standard car delivery — good for large packages, all distances',
    maxRecommendedKm: 100,
  },
  [VehicleType.MOTORBIKE]: {
    type: VehicleType.MOTORBIKE,
    name: 'Motorbike',
    profile: OsrmProfile.DRIVING,
    speedMultiplier: 0.85, // Motorbikes are faster in city traffic
    baseFee: 30,
    perKmFee: 10,
    perMinuteFee: 1.5,
    icon: '🏍️',
    description: 'Fast motorbike delivery — best for city traffic, small packages',
    maxRecommendedKm: 30,
  },
  [VehicleType.BICYCLE]: {
    type: VehicleType.BICYCLE,
    name: 'Bicycle',
    profile: OsrmProfile.CYCLING,
    speedMultiplier: 1.0,
    baseFee: 20,
    perKmFee: 6,
    perMinuteFee: 1,
    icon: '🚲',
    description: 'Eco-friendly bicycle delivery — short distances, lightweight items',
    maxRecommendedKm: 8,
  },
  [VehicleType.SCOOTER]: {
    type: VehicleType.SCOOTER,
    name: 'Scooter',
    profile: OsrmProfile.DRIVING,
    speedMultiplier: 0.9,
    baseFee: 35,
    perKmFee: 12,
    perMinuteFee: 1.5,
    icon: '🛵',
    description: 'Electric scooter delivery — good city option, medium packages',
    maxRecommendedKm: 20,
  },
  [VehicleType.TRUCK]: {
    type: VehicleType.TRUCK,
    name: 'Truck',
    profile: OsrmProfile.DRIVING,
    speedMultiplier: 1.3, // Trucks are slower and more cautious
    baseFee: 150,
    perKmFee: 30,
    perMinuteFee: 4,
    icon: '🚚',
    description: 'Large truck for bulk or heavy deliveries — best for long distances',
    maxRecommendedKm: 500,
  },
};
