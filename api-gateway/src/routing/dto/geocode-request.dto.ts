import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class GeocodeRequestDto {
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class ReverseGeocodeRequestDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lon: number;
}
