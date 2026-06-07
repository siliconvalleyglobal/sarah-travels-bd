import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { TripType, FlightClass } from "@travel/database";

export class FlightSearchDto {
  @IsString()
  origin!: string;

  @IsString()
  destination!: string;

  @IsDateString()
  departureDate!: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsEnum(TripType)
  tripType!: TripType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  infants?: number;

  @IsOptional()
  @IsEnum(FlightClass)
  cabinClass?: FlightClass;
}
