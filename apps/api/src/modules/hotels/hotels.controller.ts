import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { PaymentMethod } from "@travel/database";
import { HotelsService } from "./hotels.service";
import { HotelSearchDto } from "./dto/hotel-search.dto";
import { HotelBookDto } from "./dto/hotel-book.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/auth.decorators";

@Controller("hotels")
export class HotelsController {
  constructor(private hotelsService: HotelsService) {}

  @Get("destinations")
  getDestinations() {
    return this.hotelsService.getDestinations();
  }

  @Get("search")
  search(@Query() dto: HotelSearchDto) {
    return this.hotelsService.search(dto);
  }

  @Get(":slug")
  findOne(
    @Param("slug") slug: string,
    @Query("checkIn") checkIn?: string,
    @Query("checkOut") checkOut?: string,
  ) {
    return this.hotelsService.findBySlug(slug, checkIn, checkOut);
  }

  @Post("book")
  @UseGuards(JwtAuthGuard)
  book(@CurrentUser() user: { id: string }, @Body() dto: HotelBookDto) {
    return this.hotelsService.createBooking(user.id, dto);
  }

  @Post("book/:bookingId/pay")
  @UseGuards(JwtAuthGuard)
  pay(
    @CurrentUser() user: { id: string },
    @Param("bookingId") bookingId: string,
    @Body() body: { method: PaymentMethod },
  ) {
    return this.hotelsService.confirmBooking(bookingId, user.id, body.method);
  }
}
