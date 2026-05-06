import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface NominatimSearchResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address?: NominatimAddress;
}

export interface NominatimAddress {
  road?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
  house_number?: string;
  neighbourhood?: string;
}

export interface GeocodedLocation {
  lat: number;
  lon: number;
  displayName: string;
  address: NominatimAddress;
  importance: number;
  type: string;
}

@Injectable()
export class NominatimService {
  private readonly logger = new Logger(NominatimService.name);
  private readonly http: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org';
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'User-Agent': 'NestJS-OSRM-Demo/1.0',
        'Accept-Language': 'en',
      },
    });
    this.logger.log(`Nominatim URL: ${this.baseUrl}`);
  }

  /**
   * Convert an address string to coordinates (geocoding).
   */
  async geocode(address: string, limit = 5): Promise<GeocodedLocation[]> {
    try {
      const { data } = await this.http.get<NominatimSearchResult[]>('/search', {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit,
        },
      });

      return data.map((item) => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        displayName: item.display_name,
        address: item.address || {},
        importance: item.importance,
        type: item.type,
      }));
    } catch (err) {
      this.logger.error(`Geocoding failed for "${address}":`, err.message);
      throw new Error(`Geocoding failed: ${err.message}`);
    }
  }

  /**
   * Convert coordinates to an address (reverse geocoding).
   */
  async reverseGeocode(lat: number, lon: number): Promise<GeocodedLocation> {
    try {
      const { data } = await this.http.get<NominatimSearchResult>('/reverse', {
        params: {
          lat,
          lon,
          format: 'json',
          addressdetails: 1,
        },
      });

      return {
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        displayName: data.display_name,
        address: data.address || {},
        importance: data.importance || 0,
        type: data.type,
      };
    } catch (err) {
      this.logger.error(`Reverse geocoding failed for [${lat}, ${lon}]:`, err.message);
      throw new Error(`Reverse geocoding failed: ${err.message}`);
    }
  }
}
