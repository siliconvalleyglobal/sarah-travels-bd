import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  BookingStatus, BookingType, PaymentMethod, PaymentStatus, VisaStatus,
} from "@travel/database";
import { PrismaService } from "../../prisma/prisma.service";
import { VisaApplyDto } from "./dto/visa-apply.dto";

@Injectable()
export class VisaService {
  constructor(private prisma: PrismaService) {}

  listCountries() {
    return this.prisma.visaCountry.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  getCountry(code: string) {
    return this.prisma.visaCountry.findUnique({ where: { code: code.toUpperCase() } });
  }

  getApplications(userId: string) {
    return this.prisma.visaApplication.findMany({
      where: { userId },
      include: { visaCountry: true, documents: true, booking: true },
      orderBy: { createdAt: "desc" },
    });
  }

  generateBookingRef() {
    return `VSA${Date.now().toString(36).toUpperCase()}`;
  }

  private calcTotal(baseFee: number) {
    const serviceFee = baseFee * 0.1;
    const vatAmount = serviceFee * 0.15;
    return { baseFee, serviceFee, vatAmount, totalAmount: baseFee + serviceFee + vatAmount };
  }

  async createApplication(userId: string, dto: VisaApplyDto) {
    const country = await this.prisma.visaCountry.findUnique({
      where: { code: dto.countryCode.toUpperCase() },
    });
    if (!country) throw new NotFoundException("Visa country not found");

    const pricing = this.calcTotal(Number(country.fee));
    const applicantNote = JSON.stringify({
      firstName: dto.firstName,
      lastName: dto.lastName,
      passportNumber: dto.passportNumber,
      passportExpiry: dto.passportExpiry,
    });

    const booking = await this.prisma.booking.create({
      data: {
        bookingRef: this.generateBookingRef(),
        type: BookingType.VISA,
        status: BookingStatus.PENDING_PAYMENT,
        userId,
        totalAmount: pricing.totalAmount,
        contactEmail: dto.email,
        contactPhone: dto.phone,
        visaApplication: {
          create: {
            userId,
            visaCountryId: country.id,
            status: VisaStatus.DRAFT,
            travelDate: dto.travelDate ? new Date(dto.travelDate) : undefined,
            notes: applicantNote,
          },
        },
      },
      include: {
        visaApplication: { include: { visaCountry: true } },
      },
    });

    return {
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      status: booking.status,
      totalAmount: pricing.totalAmount,
      breakdown: pricing,
      application: booking.visaApplication,
    };
  }

  async confirmApplication(bookingId: string, userId: string, method: PaymentMethod) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId, type: BookingType.VISA },
      include: { visaApplication: true },
    });
    if (!booking) throw new NotFoundException("Application not found");
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException("Application is not awaiting payment");
    }

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId,
        amount: booking.totalAmount,
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
        data: { status: BookingStatus.CONFIRMED, paidAmount: booking.totalAmount },
      }),
      this.prisma.visaApplication.update({
        where: { id: booking.visaApplication!.id },
        data: { status: VisaStatus.SUBMITTED },
      }),
    ]);

    return {
      bookingRef: booking.bookingRef,
      status: VisaStatus.SUBMITTED,
      paymentId: payment.id,
    };
  }
}
