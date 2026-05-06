export interface RouteStep {
  maneuver: string;
  name: string;
  distance: number;
  duration: number;
  coordinates: [number, number][];
}

export interface RouteLeg {
  distance: number;
  duration: number;
  steps: RouteStep[];
  summary: string;
}

export interface RouteResult {
  distance_meters: number;
  distance_km: number;
  duration_seconds: number;
  duration_minutes: number;
  geometry: {
    type: string;
    coordinates: [number, number][];
  };
  legs: RouteLeg[];
  waypoints: Array<{
    name: string;
    location: [number, number];
    distance: number;
  }>;
}
