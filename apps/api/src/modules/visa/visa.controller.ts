import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { PaymentMethod } from "@travel/database";
import { VisaService } from "./visa.service";
import { VisaApplyDto } from "./dto/visa-apply.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/auth.decorators";

@Controller("visa")
export class VisaController {
  constructor(private visaService: VisaService) {}

  @Get("countries")
  listCountries() {
    return this.visaService.listCountries();
  }

  @Get("countries/:code")
  getCountry(@Param("code") code: string) {
    return this.visaService.getCountry(code);
  }

  @Get("applications")
  @UseGuards(JwtAuthGuard)
  getApplications(@CurrentUser() user: { id: string }) {
    return this.visaService.getApplications(user.id);
  }

  @Post("applications")
  @UseGuards(JwtAuthGuard)
  createApplication(@CurrentUser() user: { id: string }, @Body() dto: VisaApplyDto) {
    return this.visaService.createApplication(user.id, dto);
  }

  @Post("applications/:bookingId/pay")
  @UseGuards(JwtAuthGuard)
  pay(
    @CurrentUser() user: { id: string },
    @Param("bookingId") bookingId: string,
    @Body() body: { method: PaymentMethod },
  ) {
    return this.visaService.confirmApplication(bookingId, user.id, body.method);
  }
}
