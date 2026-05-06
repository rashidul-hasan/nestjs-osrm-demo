import { Injectable, Logger } from '@nestjs/common';
import { OsrmService } from '../osrm/osrm.service';
import { NominatimService } from '../nominatim/nominatim.service';

export interface Coordinate {
  lat: number;
  lon: number;
}

export interface RouteStep {
  maneuver: string;
  maneuverModifier?: string;
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

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  constructor(
    private readonly osrmService: OsrmService,
    private readonly nominatimService: NominatimService,
  ) {}

  async findRoute(
    origin: Coordinate,
    destination: Coordinate,
    profile: string = 'driving',
    options: Record<string, string | boolean> = {},
  ): Promise<RouteResult> {
    const coordinates: [number, number][] = [
      [origin.lon, origin.lat],
      [destination.lon, destination.lat],
    ];

    const osrmResponse = await this.osrmService.getRoute(profile, coordinates, options);
    const best = osrmResponse.routes[0];

    const legs: RouteLeg[] = best.legs.map((leg) => ({
      distance: leg.distance,
      duration: leg.duration,
      summary: leg.summary,
      steps: leg.steps.map((step) => ({
        maneuver: step.maneuver.type,
        maneuverModifier: step.maneuver.modifier,
        name: step.name,
        distance: step.distance,
        duration: step.duration,
        coordinates: step.geometry.coordinates as [number, number][],
      })),
    }));

    return {
      distance_meters: best.distance,
      distance_km: parseFloat((best.distance / 1000).toFixed(2)),
      duration_seconds: Math.round(best.duration),
      duration_minutes: parseFloat((best.duration / 60).toFixed(1)),
      geometry: best.geometry,
      legs,
      waypoints: osrmResponse.waypoints.map((wp) => ({
        name: wp.name,
        location: wp.location,
        distance: wp.distance,
      })),
    };
  }

  async findNearest(lat: number, lon: number, profile: string = 'driving') {
    return this.osrmService.getNearest(profile, lon, lat);
  }

  async getDistanceTable(
    coordinates: Array<{ lat: number; lon: number }>,
    profile: string = 'driving',
  ) {
    const coords: [number, number][] = coordinates.map((c) => [c.lon, c.lat]);
    const response = await this.osrmService.getTable(profile, coords);

    return {
      durations_seconds: response.durations,
      distances_meters: response.distances,
      sources: response.sources,
      destinations: response.destinations,
    };
  }

  async geocode(address: string) {
    return this.nominatimService.geocode(address);
  }

  async reverseGeocode(lat: number, lon: number) {
    return this.nominatimService.reverseGeocode(lat, lon);
  }
}
