import { Injectable } from "@nestjs/common";
import { PaymentMethod, PaymentStatus } from "@travel/database";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  initiate(data: {
    bookingId: string;
    userId: string;
    amount: number;
    method: PaymentMethod;
  }) {
    return this.prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        userId: data.userId,
        amount: data.amount,
        method: data.method,
        status: PaymentStatus.PENDING,
      },
    });
  }

  async handleWebhook(gatewayRef: string, status: PaymentStatus, response: unknown) {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayRef },
      include: { booking: true },
    });
    if (!payment) return null;

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        gatewayResponse: response as object,
        paidAt: status === PaymentStatus.COMPLETED ? new Date() : undefined,
      },
    });

    if (status === PaymentStatus.COMPLETED) {
      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: "CONFIRMED",
          paidAmount: payment.amount,
        },
      });
    }

    return updated;
  }

  getMethods() {
    return {
      bangladesh: [
        { id: "BKASH", name: "bKash", icon: "bkash" },
        { id: "NAGAD", name: "Nagad", icon: "nagad" },
        { id: "ROCKET", name: "Rocket", icon: "rocket" },
        { id: "SSLCOMMERZ", name: "Card / Mobile Banking", icon: "sslcommerz" },
      ],
      international: [
        { id: "VISA", name: "Visa", icon: "visa" },
        { id: "MASTERCARD", name: "Mastercard", icon: "mastercard" },
        { id: "AMEX", name: "American Express", icon: "amex" },
      ],
    };
  }
}
