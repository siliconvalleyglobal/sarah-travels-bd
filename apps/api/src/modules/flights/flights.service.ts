import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  BookingStatus, BookingType, TripType, FlightClass, PaymentMethod, PaymentStatus,
} from "@travel/database";
import { PrismaService } from "../../prisma/prisma.service";
import { FlightSearchDto } from "./dto/flight-search.dto";
import { FlightBookDto } from "./dto/flight-book.dto";

@Injectable()
export class FlightsService {
  constructor(private prisma: PrismaService) {}

  async search(dto: FlightSearchDto) {
    // Amadeus integration placeholder — returns mock results until API keys are configured
    const hasAmadeus =
      process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET;

    if (!hasAmadeus) {
      return this.mockSearchResults(dto);
    }

    // TODO: integrate Amadeus Flight Offers Search API
    return this.mockSearchResults(dto);
  }

  private atTime(base: Date, hours: number, minutes: number) {
    const d = new Date(base);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  private mockSearchResults(dto: FlightSearchDto) {
    const departure = new Date(dto.departureDate);
    const returnDate = dto.returnDate ? new Date(dto.returnDate) : null;

    const outbound = (airline: string, flightNumber: string, depH: number, depM: number, dur: number, price: number, name: string, extra?: object) => {
      const dep = this.atTime(departure, depH, depM);
      const arr = new Date(dep.getTime() + dur * 60000);
      return {
        id: `offer-${flightNumber}`,
        airline,
        airlineName: name,
        price: { total: price, currency: "BDT" },
        segments: [
          {
            origin: dto.origin,
            destination: dto.destination,
            departureAt: dep.toISOString(),
            arrivalAt: arr.toISOString(),
            flightNumber,
            duration: dur,
          },
          ...(returnDate
            ? [{
                origin: dto.destination,
                destination: dto.origin,
                departureAt: this.atTime(returnDate, depH + 2, depM).toISOString(),
                arrivalAt: new Date(this.atTime(returnDate, depH + 2, depM).getTime() + dur * 60000).toISOString(),
                flightNumber: `${flightNumber}R`,
                duration: dur,
              }]
            : []),
        ],
        baggage: { checked: "30kg", cabin: "7kg" },
        fareRules: { refundable: true, changeFee: 3500 },
        ...extra,
      };
    };

    const offers = [
      outbound("BG", "BG-047", 8, 30, 270, 52000, "Biman Bangladesh Airlines"),
      outbound("EK", "EK-583", 11, 15, 290, 78500, "Emirates Airlines", { fareRules: { refundable: true, changeFee: 4000 } }),
      outbound("FZ", "FZ-502", 15, 45, 285, 48000, "FlyDubai", { fareRules: { refundable: false, changeFee: 5000 }, baggage: { checked: "20kg", cabin: "7kg" } }),
      {
        id: "offer-GF-250",
        airline: "GF",
        airlineName: "Gulf Air",
        price: { total: 45000, currency: "BDT" },
        segments: [
          {
            origin: dto.origin,
            destination: "BAH",
            departureAt: this.atTime(departure, 6, 15).toISOString(),
            arrivalAt: new Date(this.atTime(departure, 6, 15).getTime() + 320 * 60000).toISOString(),
            flightNumber: "GF-250",
            duration: 320,
          },
          {
            origin: "BAH",
            destination: dto.destination,
            departureAt: this.atTime(departure, 10, 45).toISOString(),
            arrivalAt: new Date(this.atTime(departure, 10, 45).getTime() + 180 * 60000).toISOString(),
            flightNumber: "GF-251",
            duration: 180,
          },
        ],
        baggage: { checked: "23kg", cabin: "7kg" },
        fareRules: { refundable: true, changeFee: 4500 },
      },
      outbound("BS", "BS-315", 21, 45, 295, 43000, "US-Bangla Airlines", { fareRules: { refundable: false, changeFee: 3000 }, baggage: { checked: "20kg", cabin: "7kg" } }),
      outbound("QR", "QR-641", 2, 15, 280, 89000, "Qatar Airways", { fareRules: { refundable: true, changeFee: 6000 } }),
    ];

    return { source: "mock", tripType: dto.tripType, offers };
  }

  private calcTotal(baseFare: number) {
    const serviceFee = baseFare * 0.05;
    const vatAmount = serviceFee * 0.15;
    return { baseFare, serviceFee, vatAmount, totalAmount: baseFare + serviceFee + vatAmount };
  }

  generatePnr() {
    return `PNR-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  generateBookingRef() {
    return `FLT${Date.now().toString(36).toUpperCase()}`;
  }

  async createBooking(data: {
    userId: string;
    agentId?: string;
    tripType: TripType;
    cabinClass: FlightClass;
    totalAmount: number;
    contactEmail: string;
    contactPhone: string;
    segments: Array<{
      airline: string;
      flightNumber: string;
      origin: string;
      destination: string;
      departureAt: Date;
      arrivalAt: Date;
      duration?: number;
    }>;
    passengers: Array<{
      firstName: string;
      lastName: string;
      dateOfBirth: Date;
      gender: string;
      passportNumber?: string;
      passportExpiry?: Date;
    }>;
  }) {
    return this.prisma.booking.create({
      data: {
        bookingRef: this.generateBookingRef(),
        type: BookingType.FLIGHT,
        status: BookingStatus.PENDING_PAYMENT,
        userId: data.userId,
        agentId: data.agentId,
        totalAmount: data.totalAmount,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        flightBooking: {
          create: {
            tripType: data.tripType,
            cabinClass: data.cabinClass,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            segments: {
              create: data.segments.map((s, i) => ({
                segmentOrder: i + 1,
                ...s,
              })),
            },
            passengers: { create: data.passengers },
          },
        },
      },
      include: {
        flightBooking: {
          include: { segments: true, passengers: true },
        },
      },
    });
  }

  async createCustomerBooking(userId: string, dto: FlightBookDto) {
    const pricing = this.calcTotal(dto.baseFare);

    const booking = await this.createBooking({
      userId,
      tripType: dto.tripType,
      cabinClass: dto.cabinClass ?? FlightClass.ECONOMY,
      totalAmount: pricing.totalAmount,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      segments: dto.segments.map((s) => ({
        airline: s.airline,
        flightNumber: s.flightNumber,
        origin: s.origin,
        destination: s.destination,
        departureAt: new Date(s.departureAt),
        arrivalAt: new Date(s.arrivalAt),
        duration: s.duration,
      })),
      passengers: dto.passengers.map((p) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: new Date(p.dateOfBirth),
        gender: p.gender,
        passportNumber: p.passportNumber,
        passportExpiry: p.passportExpiry ? new Date(p.passportExpiry) : undefined,
      })),
    });

    return {
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      status: booking.status,
      totalAmount: pricing.totalAmount,
      breakdown: pricing,
      flightBooking: booking.flightBooking,
    };
  }

  async confirmBooking(bookingId: string, userId: string, method: PaymentMethod) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId, type: BookingType.FLIGHT },
      include: { flightBooking: true },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException("Booking is not awaiting payment");
    }

    const pnr = this.generatePnr();
    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;

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
        data: { status: BookingStatus.TICKETED, paidAmount: booking.totalAmount },
      }),
      this.prisma.flightBooking.update({
        where: { id: booking.flightBooking!.id },
        data: { pnr, providerRef: ticketNumber },
      }),
      this.prisma.flightPassenger.updateMany({
        where: { flightBookingId: booking.flightBooking!.id },
        data: { ticketNumber },
      }),
    ]);

    return {
      bookingRef: booking.bookingRef,
      pnr,
      ticketNumber,
      status: BookingStatus.TICKETED,
      paymentId: payment.id,
    };
  }
}
