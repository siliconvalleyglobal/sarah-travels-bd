import { IsDateString, IsEmail, IsInt, IsOptional, IsString, Min } from "class-validator";

export class HotelBookDto {
  @IsString()
  hotelSlug!: string;

  @IsString()
  roomCode!: string;

  @IsDateString()
  checkIn!: string;

  @IsDateString()
  checkOut!: string;

  @IsInt()
  @Min(1)
  rooms!: number;

  @IsInt()
  @Min(1)
  adults!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number;

  @IsString()
  guestName!: string;

  @IsEmail()
  guestEmail!: string;

  @IsString()
  guestPhone!: string;

  @IsOptional()
  @IsString()
  specialRequest?: string;
}
