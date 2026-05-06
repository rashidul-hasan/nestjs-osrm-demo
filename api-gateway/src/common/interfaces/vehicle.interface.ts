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

export interface VehicleTypeInfo {
  type: VehicleType;
  name: string;
  profile: OsrmProfile;
  speedMultiplier: number;
  baseFee: number;
  perKmFee: number;
  perMinuteFee: number;
  icon: string;
  description: string;
}
