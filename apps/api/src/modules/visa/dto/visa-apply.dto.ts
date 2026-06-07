import { IsDateString, IsEmail, IsOptional, IsString } from "class-validator";

export class VisaApplyDto {
  @IsString()
  countryCode!: string;

  @IsOptional()
  @IsDateString()
  travelDate?: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  passportNumber!: string;

  @IsOptional()
  @IsDateString()
  passportExpiry?: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;
}
