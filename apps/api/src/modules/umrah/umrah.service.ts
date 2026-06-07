import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  BookingStatus, BookingType, InstallmentStatus, PaymentMethod, PaymentStatus, Prisma,
} from "@travel/database";
import { PrismaService } from "../../prisma/prisma.service";
import { UmrahBookDto } from "./dto/umrah-book.dto";

@Injectable()
export class UmrahService {
  constructor(private prisma: PrismaService) {}

  listPackages() {
    return this.prisma.umrahPackage.findMany({
      where: { isActive: true },
      include: { installments: { orderBy: { installmentNo: "asc" } } },
      orderBy: { price: "asc" },
    });
  }

  getPackage(slug: string) {
    return this.prisma.umrahPackage.findUnique({
      where: { slug },
      include: { installments: { orderBy: { installmentNo: "asc" } } },
    });
  }

  getBookings(userId: string) {
    return this.prisma.umrahBooking.findMany({
      where: { userId },
      include: {
        umrahPackage: true,
        booking: true,
        installments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  generateBookingRef() {
    return `UMR${Date.now().toString(36).toUpperCase()}`;
  }

  private calcTotal(basePrice: number, pilgrimCount: number) {
    const baseFare = basePrice * pilgrimCount;
    const serviceFee = baseFare * 0.05;
    const vatAmount = serviceFee * 0.15;
    return { baseFare, serviceFee, vatAmount, totalAmount: baseFare + serviceFee + vatAmount };
  }

  async createBooking(userId: string, dto: UmrahBookDto) {
    const pkg = await this.prisma.umrahPackage.findUnique({
      where: { slug: dto.packageSlug, isActive: true },
      include: { installments: { orderBy: { installmentNo: "asc" } } },
    });
    if (!pkg) throw new NotFoundException("Umrah package not found");

    const pricing = this.calcTotal(Number(pkg.price), dto.pilgrimCount);
    const travelDate = new Date(dto.travelDate);

    const installmentRows = pkg.installments.length > 0
      ? pkg.installments.map((plan) => ({
          installmentNo: plan.installmentNo,
          amount: Number(plan.amount) * dto.pilgrimCount,
          dueDate: new Date(travelDate.getTime() - plan.dueDaysBefore * 24 * 60 * 60 * 1000),
          status: InstallmentStatus.PENDING,
        }))
      : [{
          installmentNo: 1,
          amount: pricing.totalAmount,
          dueDate: travelDate,
          status: InstallmentStatus.PENDING,
        }];

    const booking = await this.prisma.booking.create({
      data: {
        bookingRef: this.generateBookingRef(),
        type: BookingType.UMRAH,
        status: BookingStatus.PENDING_PAYMENT,
        userId,
        totalAmount: pricing.totalAmount,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        umrahBooking: {
          create: {
            userId,
            umrahPackageId: pkg.id,
            pilgrimCount: dto.pilgrimCount,
            groupName: dto.groupName,
            travelDate,
            pilgrimDocs: dto.pilgrimDocs
              ? (dto.pilgrimDocs as Prisma.InputJsonValue)
              : undefined,
            installments: { create: installmentRows },
          },
        },
      },
      include: {
        umrahBooking: {
          include: { umrahPackage: true, installments: true },
        },
      },
    });

    const downPayment = installmentRows[0]?.amount ?? pricing.totalAmount;

    return {
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      status: booking.status,
      totalAmount: pricing.totalAmount,
      downPayment,
      breakdown: pricing,
      umrahBooking: booking.umrahBooking,
    };
  }

  async confirmBooking(bookingId: string, userId: string, method: PaymentMethod) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId, type: BookingType.UMRAH },
      include: { umrahBooking: { include: { installments: true } } },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException("Booking is not awaiting payment");
    }

    const firstInstallment = booking.umrahBooking!.installments.sort(
      (a, b) => a.installmentNo - b.installmentNo,
    )[0];
    const payAmount = firstInstallment ? Number(firstInstallment.amount) : Number(booking.totalAmount);

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId,
        amount: payAmount,
        method,
        status: PaymentStatus.PENDING,
        gatewayRef: `SANDBOX-${booking.bookingRef}`,
      },
    });

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
      }),
      this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
          paidAmount: payAmount,
        },
      }),
      ...(firstInstallment
        ? [this.prisma.installmentPayment.update({
            where: { id: firstInstallment.id },
            data: { status: InstallmentStatus.PAID, paidAt: new Date(), paymentId: payment.id },
          })]
        : []),
    ]);

    return {
      bookingRef: booking.bookingRef,
      status: BookingStatus.CONFIRMED,
      downPaymentPaid: payAmount,
      paymentId: payment.id,
    };
  }
}
