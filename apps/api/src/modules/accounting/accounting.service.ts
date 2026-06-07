import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  getAccounts() {
    return this.prisma.account.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });
  }

  getLedger(from?: string, to?: string) {
    return this.prisma.ledgerEntry.findMany({
      where: {
        entryDate: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      },
      include: { account: true, booking: true },
      orderBy: { entryDate: "desc" },
    });
  }

  async getProfitAndLoss(from: string, to: string) {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: {
        entryDate: { gte: new Date(from), lte: new Date(to) },
      },
      include: { account: true },
    });

    let revenue = 0;
    let expenses = 0;

    for (const entry of entries) {
      if (entry.account.type === "REVENUE") {
        revenue += Number(entry.credit) - Number(entry.debit);
      } else if (entry.account.type === "EXPENSE") {
        expenses += Number(entry.debit) - Number(entry.credit);
      }
    }

    return { revenue, expenses, netProfit: revenue - expenses, period: { from, to } };
  }
}
