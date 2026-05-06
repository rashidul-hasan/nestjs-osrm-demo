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
import { firstValueFrom, timeout } from 'rxjs';
import { DeliveryEstimateDto, CompareVehiclesDto } from './dto/delivery-request.dto';

@Controller('delivery')
export class DeliveryController {
  constructor(
    @Inject('ROUTING_SERVICE') private readonly routingClient: ClientProxy,
  ) {}

  @Get('vehicle-types')
  async getVehicleTypes() {
    try {
      const result = await firstValueFrom(
        this.routingClient.send('get_vehicle_types', {}).pipe(timeout(5000)),
      );
      return { success: true, data: result };
    } catch (err) {
      throw new HttpException('Failed to get vehicle types', HttpStatus.BAD_GATEWAY);
    }
  }

  @Post('estimate')
  async estimateDelivery(@Body(ValidationPipe) dto: DeliveryEstimateDto) {
    try {
      const result = await firstValueFrom(
        this.routingClient.send('calculate_delivery', dto).pipe(timeout(15000)),
      );
      return { success: true, data: result };
    } catch (err) {
      throw new HttpException(
        err.message || 'Failed to estimate delivery',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Post('compare')
  async compareVehicles(@Body(ValidationPipe) dto: CompareVehiclesDto) {
    try {
      const result = await firstValueFrom(
        this.routingClient.send('compare_vehicles', dto).pipe(timeout(30000)),
      );
      return { success: true, data: result };
    } catch (err) {
      throw new HttpException('Failed to compare vehicles', HttpStatus.BAD_GATEWAY);
    }
  }
}
