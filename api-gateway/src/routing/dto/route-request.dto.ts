import { IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { OsrmProfile } from '../../common/interfaces/vehicle.interface';

export class CoordinateDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lon: number;
}

export class RouteRequestDto {
  @Type(() => CoordinateDto)
  origin: CoordinateDto;

  @Type(() => CoordinateDto)
  destination: CoordinateDto;

  @IsOptional()
  @IsEnum(OsrmProfile)
  profile?: OsrmProfile = OsrmProfile.DRIVING;

  @IsOptional()
  steps?: boolean = true;

  @IsOptional()
  overview?: string = 'full';
}
