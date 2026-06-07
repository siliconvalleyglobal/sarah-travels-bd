import { IsBoolean, IsDateString, IsEmail, IsString } from "class-validator";

export class CarBookDto {
  @IsString()
  vehicleSlug!: string;

  @IsString()
  pickupLocation!: string;

  @IsDateString()
  pickupDate!: string;

  @IsBoolean()
  includeDriver!: boolean;

  @IsString()
  guestName!: string;

  @IsEmail()
  guestEmail!: string;

  @IsString()
  guestPhone!: string;
}
