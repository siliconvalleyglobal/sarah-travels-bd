import { IsDateString, IsEmail, IsInt, IsString, Min } from "class-validator";

export class TourBookDto {
  @IsString()
  tourSlug!: string;

  @IsInt()
  @Min(1)
  guests!: number;

  @IsDateString()
  travelDate!: string;

  @IsString()
  guestName!: string;

  @IsEmail()
  guestEmail!: string;

  @IsString()
  guestPhone!: string;
}
