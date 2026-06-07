import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  findByUser(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        flightBooking: { include: { segments: true } },
        visaApplication: { include: { visaCountry: true } },
        umrahBooking: { include: { umrahPackage: true } },
        hotelBooking: { include: { hotel: true, room: true } },
        tourBooking: { include: { tour: true } },
        carBooking: { include: { vehicle: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findByRef(bookingRef: string) {
    return this.prisma.booking.findUnique({
      where: { bookingRef },
      include: {
        flightBooking: { include: { segments: true, passengers: true } },
        visaApplication: { include: { visaCountry: true, documents: true } },
        umrahBooking: { include: { umrahPackage: true, installments: true } },
        hotelBooking: { include: { hotel: true, room: true } },
        tourBooking: { include: { tour: true } },
        carBooking: { include: { vehicle: true } },
        payments: true,
        refunds: true,
      },
    });
  }
}
