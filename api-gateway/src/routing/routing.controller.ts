import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { RouteRequestDto } from './dto/route-request.dto';
import { GeocodeRequestDto, ReverseGeocodeRequestDto } from './dto/geocode-request.dto';

@Controller('routing')
export class RoutingController {
  constructor(
    @Inject('ROUTING_SERVICE') private readonly routingClient: ClientProxy,
  ) {}

  @Post('route')
  async findRoute(@Body(ValidationPipe) dto: RouteRequestDto) {
    console.log('find route dto', dto)
    try {
      const result = await firstValueFrom(
        this.routingClient.send('find_route', dto).pipe(
          timeout(15000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'Routing service error',
              HttpStatus.BAD_GATEWAY,
            );
          }),
        ),
      );
      return {
        success: true,
        data: result,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        'Failed to calculate route',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('nearest')
  async findNearest(@Body(ValidationPipe) body: { lat: number; lon: number; profile?: string }) {
    try {
      const result = await firstValueFrom(
        this.routingClient.send('find_nearest', body).pipe(timeout(10000)),
      );
      return { success: true, data: result };
    } catch (err) {
      throw new HttpException('Failed to find nearest road', HttpStatus.BAD_GATEWAY);
    }
  }

  @Post('geocode')
  async geocode(@Body(ValidationPipe) dto: GeocodeRequestDto) {
    try {
      const result = await firstValueFrom(
        this.routingClient.send('geocode', dto).pipe(timeout(10000)),
      );
      return { success: true, data: result };
    } catch (err) {
      throw new HttpException('Geocoding failed', HttpStatus.BAD_GATEWAY);
    }
  }

  @Post('reverse-geocode')
  async reverseGeocode(@Body(ValidationPipe) dto: ReverseGeocodeRequestDto) {
    try {
      const result = await firstValueFrom(
        this.routingClient.send('reverse_geocode', dto).pipe(timeout(10000)),
      );
      return { success: true, data: result };
    } catch (err) {
      throw new HttpException('Reverse geocoding failed', HttpStatus.BAD_GATEWAY);
    }
  }

  @Post('table')
  async getDistanceTable(
    @Body()
    body: {
      coordinates: Array<{ lat: number; lon: number }>;
      profile?: string;
    },
  ) {
    try {
      const result = await firstValueFrom(
        this.routingClient.send('distance_table', body).pipe(timeout(15000)),
      );
      return { success: true, data: result };
    } catch (err) {
      throw new HttpException('Distance table failed', HttpStatus.BAD_GATEWAY);
    }
  }
}
