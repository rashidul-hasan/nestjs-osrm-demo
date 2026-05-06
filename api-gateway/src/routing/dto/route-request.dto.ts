import { IsNumber, IsEnum, IsOptional, Min, Max, ValidateNested, IsDefined, IsBoolean, IsString } from 'class-validator';
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
  @IsDefined()
  @ValidateNested()
  @Type(() => CoordinateDto)
  origin: CoordinateDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => CoordinateDto)
  destination: CoordinateDto;

  @IsOptional()
  @IsEnum(OsrmProfile)
  profile?: OsrmProfile = OsrmProfile.DRIVING;

  @IsOptional()
  @IsBoolean()
  steps?: boolean = true;

  @IsOptional()
  @IsString()
  overview?: string = 'full';
}
