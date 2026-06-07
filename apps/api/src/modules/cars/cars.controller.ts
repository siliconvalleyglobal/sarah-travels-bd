import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { PaymentMethod } from "@travel/database";
import { CarsService } from "./cars.service";
import { CarBookDto } from "./dto/car-book.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/auth.decorators";

@Controller("cars")
export class CarsController {
  constructor(private carsService: CarsService) {}

  @Get("search")
  search(@Query("pickup") pickup?: string) {
    return this.carsService.list(pickup);
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.carsService.findBySlug(slug);
  }

  @Post("book")
  @UseGuards(JwtAuthGuard)
  book(@CurrentUser() user: { id: string }, @Body() dto: CarBookDto) {
    return this.carsService.createBooking(user.id, dto);
  }

  @Post("book/:bookingId/pay")
  @UseGuards(JwtAuthGuard)
  pay(@CurrentUser() user: { id: string }, @Param("bookingId") bookingId: string, @Body() body: { method: PaymentMethod }) {
    return this.carsService.confirmBooking(bookingId, user.id, body.method);
  }
}
