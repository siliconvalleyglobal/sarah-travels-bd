import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/auth.decorators";

@Controller("bookings")
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.bookingsService.findByUser(user.id);
  }

  @Get(":ref")
  getByRef(@Param("ref") ref: string) {
    return this.bookingsService.findByRef(ref);
  }
}
