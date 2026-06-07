import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { PaymentMethod } from "@travel/database";
import { UmrahService } from "./umrah.service";
import { UmrahBookDto } from "./dto/umrah-book.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/auth.decorators";

@Controller("umrah")
export class UmrahController {
  constructor(private umrahService: UmrahService) {}

  @Get("packages")
  listPackages() {
    return this.umrahService.listPackages();
  }

  @Get("packages/:slug")
  getPackage(@Param("slug") slug: string) {
    return this.umrahService.getPackage(slug);
  }

  @Get("bookings")
  @UseGuards(JwtAuthGuard)
  getBookings(@CurrentUser() user: { id: string }) {
    return this.umrahService.getBookings(user.id);
  }

  @Post("book")
  @UseGuards(JwtAuthGuard)
  book(@CurrentUser() user: { id: string }, @Body() dto: UmrahBookDto) {
    return this.umrahService.createBooking(user.id, dto);
  }

  @Post("book/:bookingId/pay")
  @UseGuards(JwtAuthGuard)
  pay(
    @CurrentUser() user: { id: string },
    @Param("bookingId") bookingId: string,
    @Body() body: { method: PaymentMethod },
  ) {
    return this.umrahService.confirmBooking(bookingId, user.id, body.method);
  }
}
