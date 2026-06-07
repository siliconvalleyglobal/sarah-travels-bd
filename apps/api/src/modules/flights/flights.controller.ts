import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { PaymentMethod } from "@travel/database";
import { FlightsService } from "./flights.service";
import { FlightSearchDto } from "./dto/flight-search.dto";
import { FlightBookDto } from "./dto/flight-book.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/auth.decorators";

@Controller("flights")
export class FlightsController {
  constructor(private flightsService: FlightsService) {}

  @Get("search")
  search(@Query() dto: FlightSearchDto) {
    return this.flightsService.search(dto);
  }

  @Post("book")
  @UseGuards(JwtAuthGuard)
  book(@CurrentUser() user: { id: string }, @Body() dto: FlightBookDto) {
    return this.flightsService.createCustomerBooking(user.id, dto);
  }

  @Post("book/:bookingId/pay")
  @UseGuards(JwtAuthGuard)
  pay(
    @CurrentUser() user: { id: string },
    @Param("bookingId") bookingId: string,
    @Body() body: { method: PaymentMethod },
  ) {
    return this.flightsService.confirmBooking(bookingId, user.id, body.method);
  }
}
