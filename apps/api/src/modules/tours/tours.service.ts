import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, BookingType, PaymentMethod, PaymentStatus } from "@travel/database";
import { PrismaService } from "../../prisma/prisma.service";
import { TourBookDto } from "./dto/tour-book.dto";

@Injectable()
export class ToursService {
  constructor(private prisma: PrismaService) {}

  private toNumber(v: { toNumber(): number } | number) {
    return typeof v === "number" ? v : v.toNumber();
  }

  private mapTour(t: {
    slug: string; title: string; destination: string; durationLabel: string;
    durationDays: number; price: { toNumber(): number } | number; highlight: string;
    description: string; inclusions: unknown; exclusions: unknown; itinerary: unknown;
    imageUrl: string | null; source: string;
  }) {
    return {
      id: t.slug,
      title: t.title,
      destination: t.destination,
      duration: t.durationLabel,
      durationDays: t.durationDays,
      price: this.toNumber(t.price),
      highlight: t.highlight,
      description: t.description,
      inclusions: t.inclusions as string[],
      exclusions: t.exclusions as string[],
      itinerary: t.itinerary as Array<{ day: number; title: string; desc: string }>,
      image: t.imageUrl ?? "/images/hero_travel_bg.png",
      source: t.source,
    };
  }

  async search(destination?: string) {
    const tours = await this.prisma.tour.findMany({ where: { isActive: true }, orderBy: { price: "asc" } });
    const filtered = destination
      ? tours.filter((t) => t.destination.toLowerCase().includes(destination.toLowerCase()))
      : tours;
    return { total: filtered.length, tours: (filtered.length ? filtered : tours).map((t) => this.mapTour(t)) };
  }

  async findBySlug(slug: string) {
    const tour = await this.prisma.tour.findFirst({ where: { slug, isActive: true } });
    if (!tour) throw new NotFoundException("Tour not found");
    return this.mapTour(tour);
  }

  generateBookingRef() {
    return `TRV${Date.now().toString(36).toUpperCase()}`;
  }

  private calcTotal(baseFare: number) {
    const serviceFee = baseFare * 0.05;
    const vatAmount = serviceFee * 0.15;
    return { baseFare, serviceFee, vatAmount, totalAmount: baseFare + serviceFee + vatAmount };
  }

  async createBooking(userId: string, dto: TourBookDto) {
    const tour = await this.prisma.tour.findFirst({ where: { slug: dto.tourSlug, isActive: true } });
    if (!tour) throw new NotFoundException("Tour not found");

    const baseFare = this.toNumber(tour.price) * dto.guests;
    const pricing = this.calcTotal(baseFare);

    const booking = await this.prisma.booking.create({
      data: {
        bookingRef: this.generateBookingRef(),
        type: BookingType.TOUR,
        status: BookingStatus.PENDING_PAYMENT,
        userId,
        totalAmount: pricing.totalAmount,
        contactEmail: dto.guestEmail,
        contactPhone: dto.guestPhone,
        tourBooking: {
          create: {
            tourId: tour.id,
            guests: dto.guests,
            travelDate: new Date(dto.travelDate),
            guestName: dto.guestName,
            guestEmail: dto.guestEmail,
            guestPhone: dto.guestPhone,
          },
        },
      },
      include: { tourBooking: { include: { tour: true } } },
    });

    return { bookingId: booking.id, bookingRef: booking.bookingRef, status: booking.status, totalAmount: pricing.totalAmount, breakdown: pricing };
  }

  async confirmBooking(bookingId: string, userId: string, method: PaymentMethod) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId, type: BookingType.TOUR },
      include: { tourBooking: true },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.status !== BookingStatus.PENDING_PAYMENT) throw new BadRequestException("Booking is not awaiting payment");

    const confirmationCode = `CONF-${Math.floor(100000 + Math.random() * 900000)}`;
    const payment = await this.prisma.payment.create({
      data: { bookingId: booking.id, userId, amount: booking.totalAmount, method, status: PaymentStatus.PENDING, gatewayRef: `SANDBOX-${booking.bookingRef}` },
    });

    await this.prisma.$transaction([
      this.prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.COMPLETED, paidAt: new Date() } }),
      this.prisma.booking.update({ where: { id: booking.id }, data: { status: BookingStatus.CONFIRMED, paidAmount: booking.totalAmount } }),
      this.prisma.tourBooking.update({ where: { id: booking.tourBooking!.id }, data: { confirmationCode } }),
    ]);

    return { bookingRef: booking.bookingRef, confirmationCode, status: BookingStatus.CONFIRMED, paymentId: payment.id };
  }
}
