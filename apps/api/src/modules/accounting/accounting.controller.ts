import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AccountingService } from "./accounting.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/auth.decorators";
import { UserRole } from "@travel/database";

@Controller("accounting")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AccountingController {
  constructor(private accountingService: AccountingService) {}

  @Get("accounts")
  getAccounts() {
    return this.accountingService.getAccounts();
  }

  @Get("ledger")
  getLedger(@Query("from") from?: string, @Query("to") to?: string) {
    return this.accountingService.getLedger(from, to);
  }

  @Get("profit-loss")
  getProfitAndLoss(
    @Query("from") from: string,
    @Query("to") to: string,
  ) {
    return this.accountingService.getProfitAndLoss(from, to);
  }
}
