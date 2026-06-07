import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, BookingType, PaymentMethod, PaymentStatus } from "@travel/database";
import { PrismaService } from "../../prisma/prisma.service";
import { CarBookDto } from "./dto/car-book.dto";

const DRIVER_CHARGE = 1500;

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  private toNumber(v: { toNumber(): number } | number) {
    return typeof v === "number" ? v : v.toNumber();
  }

  private mapVehicle(v: {
    slug: string; name: string; vehicleType: string; maxPax: number; luggage: number;
    pricePerDay: { toNumber(): number } | number; description: string; imageUrl: string | null;
  }) {
    return {
      id: v.slug,
      name: v.name,
      type: v.vehicleType,
      pax: v.maxPax,
      luggage: v.luggage,
      price: this.toNumber(v.pricePerDay),
      desc: v.description,
      image: v.imageUrl ?? "/images/hero_travel_bg.png",
    };
  }

  list(pickup?: string) {
    return this.prisma.carVehicle.findMany({ where: { isActive: true }, orderBy: { pricePerDay: "asc" } })
      .then((vehicles) => ({
        pickup: pickup ?? "DAC",
        vehicles: vehicles.map((v) => this.mapVehicle(v)),
      }));
  }

  async findBySlug(slug: string) {
    const v = await this.prisma.carVehicle.findFirst({ where: { slug, isActive: true } });
    if (!v) throw new NotFoundException("Vehicle not found");
    return this.mapVehicle(v);
  }

  generateBookingRef() {
    return `CAR${Date.now().toString(36).toUpperCase()}`;
  }

  async createBooking(userId: string, dto: CarBookDto) {
    const vehicle = await this.prisma.carVehicle.findFirst({ where: { slug: dto.vehicleSlug, isActive: true } });
    if (!vehicle) throw new NotFoundException("Vehicle not found");

    const driverCharge = dto.includeDriver ? DRIVER_CHARGE : 0;
    const baseFare = this.toNumber(vehicle.pricePerDay) + driverCharge;
    const serviceFee = baseFare * 0.05;
    const vatAmount = serviceFee * 0.15;
    const totalAmount = baseFare + serviceFee + vatAmount;

    const booking = await this.prisma.booking.create({
      data: {
        bookingRef: this.generateBookingRef(),
        type: BookingType.CAR,
        status: BookingStatus.PENDING_PAYMENT,
        userId,
        totalAmount,
        contactEmail: dto.guestEmail,
        contactPhone: dto.guestPhone,
        carBooking: {
          create: {
            vehicleId: vehicle.id,
            pickupLocation: dto.pickupLocation,
            pickupDate: new Date(dto.pickupDate),
            includeDriver: dto.includeDriver,
            driverCharge,
            guestName: dto.guestName,
            guestEmail: dto.guestEmail,
            guestPhone: dto.guestPhone,
          },
        },
      },
      include: { carBooking: { include: { vehicle: true } } },
    });

    return {
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      status: booking.status,
      totalAmount,
      breakdown: { baseFare, serviceFee, vatAmount, driverCharge },
    };
  }

  async confirmBooking(bookingId: string, userId: string, method: PaymentMethod) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId, type: BookingType.CAR },
      include: { carBooking: true },
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
      this.prisma.carBooking.update({ where: { id: booking.carBooking!.id }, data: { confirmationCode } }),
    ]);

    return { bookingRef: booking.bookingRef, confirmationCode, status: BookingStatus.CONFIRMED, paymentId: payment.id };
  }
}
