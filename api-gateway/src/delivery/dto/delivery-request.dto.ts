import { IsEnum, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleType } from '../../common/interfaces/vehicle.interface';
import { CoordinateDto } from '../../routing/dto/route-request.dto';

export class DeliveryEstimateDto {
  @Type(() => CoordinateDto)
  origin: CoordinateDto;

  @Type(() => CoordinateDto)
  destination: CoordinateDto;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsOptional()
  @IsString()
  currency?: string = 'BDT';
}

export class CompareVehiclesDto {
  @Type(() => CoordinateDto)
  origin: CoordinateDto;

  @Type(() => CoordinateDto)
  destination: CoordinateDto;
}
