import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/auth.decorators";
import { PaymentMethod } from "@travel/database";

@Controller("payments")
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get("methods")
  getMethods() {
    return this.paymentsService.getMethods();
  }

  @Post("initiate")
  @UseGuards(JwtAuthGuard)
  initiate(
    @CurrentUser() user: { id: string },
    @Body() body: { bookingId: string; amount: number; method: PaymentMethod },
  ) {
    return this.paymentsService.initiate({
      userId: user.id,
      ...body,
    });
  }

  @Post("webhook/sslcommerz")
  sslcommerzWebhook(@Body() body: Record<string, unknown>) {
    return this.paymentsService.handleWebhook(
      body.tran_id as string,
      "COMPLETED",
      body,
    );
  }
}
