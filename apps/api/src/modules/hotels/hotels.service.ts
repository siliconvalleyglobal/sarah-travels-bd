import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, BookingType, PaymentMethod, PaymentStatus } from "@travel/database";
import { PrismaService } from "../../prisma/prisma.service";
import { HotelSearchDto } from "./dto/hotel-search.dto";
import { HotelBookDto } from "./dto/hotel-book.dto";

type HotelWithRelations = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  stars: number;
  reviewScore: { toNumber(): number } | number;
  reviewCount: number;
  distance: string;
  distanceKm: { toNumber(): number } | number;
  description: string;
  propertyType: string;
  amenities: unknown;
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  payAtHotel: boolean;
  dealLabel: string | null;
  dealDiscount: number | null;
  urgency: string | null;
  recommended: boolean;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string | null;
  lat: { toNumber(): number } | number;
  lng: { toNumber(): number } | number;
  area: string;
  images: { url: string; sortOrder: number }[];
  rooms: {
    id: string;
    roomCode: string;
    name: string;
    description: string;
    beds: string;
    maxGuests: number;
    pricePerNight: { toNumber(): number } | number;
    originalPrice: { toNumber(): number } | null;
    breakfast: boolean;
    freeCancellation: boolean;
    payAtHotel: boolean;
    roomsLeft: number | null;
  }[];
  reviews: {
    author: string;
    country: string;
    reviewDate: string;
    score: { toNumber(): number } | number;
    title: string;
    comment: string;
  }[];
};

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  private toNumber(value: { toNumber(): number } | number): number {
    return typeof value === "number" ? value : value.toNumber();
  }

  private normalizeCity(city: string): string {
    return city.toLowerCase().replace(/['\s-]/g, "");
  }

  private mapHotel(hotel: HotelWithRelations, nights = 1) {
    const rooms = hotel.rooms.map((r) => ({
      id: r.roomCode,
      name: r.name,
      price: this.toNumber(r.pricePerNight),
      originalPrice: r.originalPrice ? this.toNumber(r.originalPrice) : undefined,
      desc: r.description,
      beds: r.beds,
      maxGuests: r.maxGuests,
      breakfast: r.breakfast,
      freeCancellation: r.freeCancellation,
      payAtHotel: r.payAtHotel,
      roomsLeft: r.roomsLeft ?? undefined,
    }));

    const minPrice = Math.min(...rooms.map((r) => r.price));

    return {
      id: hotel.slug,
      name: hotel.name,
      city: hotel.city,
      country: hotel.country,
      stars: hotel.stars,
      reviewScore: this.toNumber(hotel.reviewScore),
      reviewCount: hotel.reviewCount,
      price: minPrice,
      originalPrice: rooms.find((r) => r.price === minPrice)?.originalPrice,
      distance: hotel.distance,
      distanceKm: this.toNumber(hotel.distanceKm),
      images: hotel.images.sort((a, b) => a.sortOrder - b.sortOrder).map((i) => i.url),
      description: hotel.description,
      propertyType: hotel.propertyType,
      amenities: hotel.amenities as string[],
      freeCancellation: hotel.freeCancellation,
      breakfastIncluded: hotel.breakfastIncluded,
      payAtHotel: hotel.payAtHotel,
      deal: hotel.dealLabel
        ? { label: hotel.dealLabel, discount: hotel.dealDiscount ?? 0 }
        : undefined,
      urgency: hotel.urgency ?? undefined,
      recommended: hotel.recommended,
      rooms,
      reviews: hotel.reviews.map((r) => ({
        author: r.author,
        country: r.country,
        date: r.reviewDate,
        score: this.toNumber(r.score),
        title: r.title,
        comment: r.comment,
      })),
      policies: {
        checkIn: hotel.checkInTime,
        checkOut: hotel.checkOutTime,
        cancellation: hotel.cancellationPolicy ?? "See property policy",
      },
      location: {
        lat: this.toNumber(hotel.lat),
        lng: this.toNumber(hotel.lng),
        area: hotel.area,
      },
      nights,
    };
  }

  private hotelInclude() {
    return {
      images: { orderBy: { sortOrder: "asc" as const } },
      rooms: { where: { isActive: true }, orderBy: { pricePerNight: "asc" as const } },
      reviews: true,
    };
  }

  private calcNights(checkIn?: string, checkOut?: string): number {
    if (!checkIn || !checkOut) return 1;
    const diff = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 1;
  }

  async search(dto: HotelSearchDto) {
    const normalized = this.normalizeCity(dto.city);
    const hotels = await this.prisma.hotel.findMany({
      where: { isActive: true },
      include: this.hotelInclude(),
    });

    const filtered = hotels.filter((h) => {
      const hotelCity = this.normalizeCity(h.city);
      return hotelCity.includes(normalized) || normalized.includes(hotelCity);
    });

    const nights = this.calcNights(dto.checkIn, dto.checkOut);
    const results = (filtered.length > 0 ? filtered : hotels).map((h) =>
      this.mapHotel(h as HotelWithRelations, nights),
    );

    return {
      city: dto.city,
      nights,
      total: results.length,
      hotels: results,
    };
  }

  async findBySlug(slug: string, checkIn?: string, checkOut?: string) {
    const hotel = await this.prisma.hotel.findFirst({
      where: { slug, isActive: true },
      include: this.hotelInclude(),
    });
    if (!hotel) throw new NotFoundException("Hotel not found");

    const nights = this.calcNights(checkIn, checkOut);
    return this.mapHotel(hotel as HotelWithRelations, nights);
  }

  getDestinations() {
    return [
      { id: "mecca", name: "Mecca", country: "Saudi Arabia", hotels: 3, icon: "🕌" },
      { id: "medina", name: "Medina", country: "Saudi Arabia", hotels: 2, icon: "🕌" },
      { id: "dhaka", name: "Dhaka", country: "Bangladesh", hotels: 2, icon: "🏙️" },
      { id: "dubai", name: "Dubai", country: "UAE", hotels: 2, icon: "🏗️" },
      { id: "coxs-bazar", name: "Cox's Bazar", country: "Bangladesh", hotels: 1, icon: "🏖️" },
    ];
  }

  generateBookingRef() {
    return `HTL${Date.now().toString(36).toUpperCase()}`;
  }

  generateConfirmationCode() {
    return `CONF-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  async createBooking(userId: string, dto: HotelBookDto) {
    const hotel = await this.prisma.hotel.findFirst({
      where: { slug: dto.hotelSlug, isActive: true },
      include: { rooms: { where: { isActive: true } } },
    });
    if (!hotel) throw new NotFoundException("Hotel not found");

    const room = hotel.rooms.find((r) => r.roomCode === dto.roomCode);
    if (!room) throw new NotFoundException("Room not found");

    const nights = this.calcNights(dto.checkIn, dto.checkOut);
    const roomRate = this.toNumber(room.pricePerNight) * nights * dto.rooms;
    const serviceFee = roomRate * 0.05;
    const vatAmount = serviceFee * 0.15;
    const totalAmount = roomRate + serviceFee + vatAmount;

    if (room.roomsLeft !== null && room.roomsLeft < dto.rooms) {
      throw new BadRequestException("Not enough rooms available");
    }

    const booking = await this.prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          bookingRef: this.generateBookingRef(),
          type: BookingType.HOTEL,
          status: BookingStatus.PENDING_PAYMENT,
          userId,
          totalAmount,
          contactEmail: dto.guestEmail,
          contactPhone: dto.guestPhone,
          notes: dto.specialRequest,
          hotelBooking: {
            create: {
              hotelId: hotel.id,
              roomId: room.id,
              checkIn: new Date(dto.checkIn),
              checkOut: new Date(dto.checkOut),
              nights,
              rooms: dto.rooms,
              adults: dto.adults,
              children: dto.children ?? 0,
              guestName: dto.guestName,
              guestEmail: dto.guestEmail,
              guestPhone: dto.guestPhone,
              specialRequest: dto.specialRequest,
              roomRate,
              serviceFee,
              vatAmount,
            },
          },
        },
        include: {
          hotelBooking: {
            include: { hotel: true, room: true },
          },
        },
      });

      if (room.roomsLeft !== null) {
        await tx.hotelRoom.update({
          where: { id: room.id },
          data: { roomsLeft: room.roomsLeft - dto.rooms },
        });
      }

      return created;
    });

    return {
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      status: booking.status,
      totalAmount: this.toNumber(booking.totalAmount),
      breakdown: {
        roomRate,
        serviceFee,
        vatAmount,
        nights,
      },
      hotel: {
        name: hotel.name,
        city: hotel.city,
        room: room.name,
      },
    };
  }

  async confirmBooking(bookingId: string, userId: string, method: PaymentMethod) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId, type: BookingType.HOTEL },
      include: { hotelBooking: true },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException("Booking is not awaiting payment");
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

    const confirmationCode = this.generateConfirmationCode();

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
      }),
      this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
          paidAmount: booking.totalAmount,
        },
      }),
      this.prisma.hotelBooking.update({
        where: { id: booking.hotelBooking!.id },
        data: { confirmationCode },
      }),
    ]);

    return {
      bookingRef: booking.bookingRef,
      confirmationCode,
      status: BookingStatus.CONFIRMED,
      paymentId: payment.id,
    };
  }
}
