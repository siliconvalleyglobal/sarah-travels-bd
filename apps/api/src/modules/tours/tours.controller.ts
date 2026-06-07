import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { PaymentMethod } from "@travel/database";
import { ToursService } from "./tours.service";
import { TourBookDto } from "./dto/tour-book.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/auth.decorators";

@Controller("tours")
export class ToursController {
  constructor(private toursService: ToursService) {}

  @Get("search")
  search(@Query("destination") destination?: string) {
    return this.toursService.search(destination);
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.toursService.findBySlug(slug);
  }

  @Post("book")
  @UseGuards(JwtAuthGuard)
  book(@CurrentUser() user: { id: string }, @Body() dto: TourBookDto) {
    return this.toursService.createBooking(user.id, dto);
  }

  @Post("book/:bookingId/pay")
  @UseGuards(JwtAuthGuard)
  pay(@CurrentUser() user: { id: string }, @Param("bookingId") bookingId: string, @Body() body: { method: PaymentMethod }) {
    return this.toursService.confirmBooking(bookingId, user.id, body.method);
  }
}
