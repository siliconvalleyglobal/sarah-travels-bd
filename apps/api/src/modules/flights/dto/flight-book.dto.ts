import {
  IsArray, IsDateString, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { FlightClass, TripType } from "@travel/database";

class FlightSegmentDto {
  @IsString()
  airline!: string;

  @IsString()
  flightNumber!: string;

  @IsString()
  origin!: string;

  @IsString()
  destination!: string;

  @IsDateString()
  departureAt!: string;

  @IsDateString()
  arrivalAt!: string;

  @IsOptional()
  @IsNumber()
  duration?: number;
}

class FlightPassengerDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsString()
  gender!: string;

  @IsOptional()
  @IsString()
  passportNumber?: string;

  @IsOptional()
  @IsDateString()
  passportExpiry?: string;
}

export class FlightBookDto {
  @IsEnum(TripType)
  tripType!: TripType;

  @IsOptional()
  @IsEnum(FlightClass)
  cabinClass?: FlightClass;

  @IsNumber()
  @Min(1)
  baseFare!: number;

  @IsEmail()
  contactEmail!: string;

  @IsString()
  contactPhone!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightSegmentDto)
  segments!: FlightSegmentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightPassengerDto)
  passengers!: FlightPassengerDto[];
}
