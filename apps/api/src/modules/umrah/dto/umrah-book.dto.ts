import { IsDateString, IsEmail, IsInt, IsObject, IsOptional, IsString, Min } from "class-validator";

export class UmrahBookDto {
  @IsString()
  packageSlug!: string;

  @IsInt()
  @Min(1)
  pilgrimCount!: number;

  @IsDateString()
  travelDate!: string;

  @IsOptional()
  @IsString()
  groupName?: string;

  @IsOptional()
  @IsObject()
  pilgrimDocs?: Record<string, unknown>;

  @IsEmail()
  contactEmail!: string;

  @IsString()
  contactPhone!: string;
}
