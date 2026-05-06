import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface OsrmRouteResponse {
  code: string;
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
      type: string;
    };
    legs: Array<{
      distance: number;
      duration: number;
      summary: string;
      steps: Array<{
        distance: number;
        duration: number;
        geometry: { coordinates: [number, number][]; type: string };
        name: string;
        maneuver: {
          type: string;
          modifier?: string;
          bearing_after: number;
          bearing_before: number;
          location: [number, number];
        };
        intersections: any[];
        driving_side: string;
        mode: string;
        ref?: string;
      }>;
    }>;
    weight: number;
    weight_name: string;
  }>;
  waypoints: Array<{
    hint: string;
    distance: number;
    name: string;
    location: [number, number];
  }>;
}

export interface OsrmNearestResponse {
  code: string;
  waypoints: Array<{
    hint: string;
    distance: number;
    name: string;
    location: [number, number];
  }>;
}

export interface OsrmTableResponse {
  code: string;
  durations: number[][];
  distances: number[][];
  sources: Array<{ hint: string; distance: number; name: string; location: [number, number] }>;
  destinations: Array<{ hint: string; distance: number; name: string; location: [number, number] }>;
}

@Injectable()
export class OsrmService {
  private readonly logger = new Logger(OsrmService.name);
  private readonly http: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OSRM_URL || 'http://localhost:5000';
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
    this.logger.log(`OSRM Backend URL: ${this.baseUrl}`);
  }

  /**
   * Get the best route between two or more coordinates.
   * @param profile - OSRM routing profile: 'driving', 'cycling', or 'walking'
   * @param coordinates - Array of [lon, lat] pairs
   * @param options - Additional OSRM query parameters
   */
  async getRoute(
    profile: string,
    coordinates: Array<[number, number]>,
    options: Record<string, string | boolean> = {},
  ): Promise<OsrmRouteResponse> {
    const coordStr = coordinates.map(([lon, lat]) => `${lon},${lat}`).join(';');
    const params = new URLSearchParams({
      steps: 'true',
      annotations: 'false',
      geometries: 'geojson',
      overview: 'full',
      ...Object.fromEntries(
        Object.entries(options).map(([k, v]) => [k, String(v)]),
      ),
    });

    const url = `/route/v1/${profile}/${coordStr}?${params}`;
    this.logger.debug(`OSRM route request: ${this.baseUrl}${url}`);

    try {
      const { data } = await this.http.get<OsrmRouteResponse>(url);
      if (data.code !== 'Ok') {
        throw new Error(`OSRM returned non-Ok status: ${data.code}`);
      }
      return data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(`OSRM request failed: ${err.message} (URL: ${this.baseUrl}${url})`);
      }
      throw err;
    }
  }

  /**
   * Find the nearest road/point to a given coordinate.
   */
  async getNearest(
    profile: string,
    lon: number,
    lat: number,
    number = 1,
  ): Promise<OsrmNearestResponse> {
    const url = `/nearest/v1/${profile}/${lon},${lat}?number=${number}`;
    try {
      const { data } = await this.http.get<OsrmNearestResponse>(url);
      return data;
    } catch (err) {
      throw new Error(`OSRM nearest failed: ${err.message}`);
    }
  }

  /**
   * Get a duration/distance matrix for multiple coordinates.
   */
  async getTable(
    profile: string,
    coordinates: Array<[number, number]>,
  ): Promise<OsrmTableResponse> {
    const coordStr = coordinates.map(([lon, lat]) => `${lon},${lat}`).join(';');
    const url = `/table/v1/${profile}/${coordStr}?annotations=distance,duration`;
    try {
      const { data } = await this.http.get<OsrmTableResponse>(url);
      if (data.code !== 'Ok') {
        throw new Error(`OSRM table returned: ${data.code}`);
      }
      return data;
    } catch (err) {
      throw new Error(`OSRM table failed: ${err.message}`);
    }
  }

  /** Health check — returns true if OSRM is reachable */
  async healthCheck(): Promise<boolean> {
    try {
      await this.http.get('/');
      return true;
    } catch {
      return false;
    }
  }
}
