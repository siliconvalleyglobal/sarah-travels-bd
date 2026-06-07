import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BookingStatus,
  BookingType,
  FlightClass,
  TripType,
  WalletTransactionType,
} from "@travel/database";
import { PrismaService } from "../../prisma/prisma.service";
import { FlightsService } from "../flights/flights.service";

@Injectable()
export class AgentsService {
  constructor(
    private prisma: PrismaService,
    private flightsService: FlightsService,
  ) {}

  findByUserId(userId: string) {
    return this.prisma.agent.findUnique({
      where: { userId },
      include: { subAgents: { include: { user: true } } },
    });
  }

  async getDashboard(agentUserId: string) {
    const agent = await this.findByUserId(agentUserId);
    if (!agent) throw new NotFoundException("Agent profile not found");

    const [bookings, commissions, recentBookings] = await Promise.all([
      this.prisma.booking.count({ where: { agentId: agent.id } }),
      this.prisma.commission.aggregate({
        where: { agentId: agent.id },
        _sum: { amount: true },
      }),
      this.prisma.booking.findMany({
        where: { agentId: agent.id },
        include: {
          flightBooking: { include: { segments: true } },
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return {
      agent,
      stats: {
        totalBookings: bookings,
        totalCommission: commissions._sum.amount ?? 0,
        creditAvailable: Number(agent.creditLimit) - Number(agent.creditUsed),
        depositBalance: agent.depositBalance,
      },
      recentBookings,
    };
  }

  async getBookings(agentUserId: string) {
    const agent = await this.findByUserId(agentUserId);
    if (!agent) throw new NotFoundException("Agent profile not found");

    return this.prisma.booking.findMany({
      where: { agentId: agent.id },
      include: {
        flightBooking: { include: { segments: true, passengers: true } },
        visaApplication: { include: { visaCountry: true } },
        umrahBooking: { include: { umrahPackage: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getWallet(agentUserId: string) {
    const agent = await this.findByUserId(agentUserId);
    if (!agent) throw new NotFoundException("Agent profile not found");

    const transactions = await this.prisma.walletTransaction.findMany({
      where: { userId: agent.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      creditLimit: agent.creditLimit,
      creditUsed: agent.creditUsed,
      creditAvailable: Number(agent.creditLimit) - Number(agent.creditUsed),
      depositBalance: agent.depositBalance,
      transactions,
    };
  }

  async bookFlightWithCredit(
    agentUserId: string,
    data: {
      totalAmount: number;
      tripType: TripType;
      cabinClass: FlightClass;
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
    },
  ) {
    const agent = await this.findByUserId(agentUserId);
    if (!agent) throw new NotFoundException("Agent profile not found");
    if (!agent.isApproved) {
      throw new BadRequestException("Agent account is not approved yet");
    }

    const creditAvailable = Number(agent.creditLimit) - Number(agent.creditUsed);
    if (creditAvailable < data.totalAmount) {
      throw new BadRequestException(
        `Insufficient credit. Available: ${creditAvailable}, Required: ${data.totalAmount}`,
      );
    }

    const booking = await this.flightsService.createBooking({
      userId: agent.userId,
      agentId: agent.id,
      ...data,
    });

    const newCreditUsed = Number(agent.creditUsed) + data.totalAmount;

    await this.prisma.$transaction([
      this.prisma.agent.update({
        where: { id: agent.id },
        data: { creditUsed: newCreditUsed },
      }),
      this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
          paidAmount: data.totalAmount,
        },
      }),
      this.prisma.walletTransaction.create({
        data: {
          userId: agent.userId,
          type: WalletTransactionType.BOOKING_PAYMENT,
          amount: -data.totalAmount,
          balanceAfter: Number(agent.creditLimit) - newCreditUsed,
          description: `Flight booking ${booking.bookingRef}`,
          referenceId: booking.id,
        },
      }),
      this.prisma.commission.create({
        data: {
          agentId: agent.id,
          bookingRef: booking.bookingRef,
          amount: (data.totalAmount * Number(agent.commissionRate)) / 100,
          rate: agent.commissionRate,
        },
      }),
    ]);

    return this.prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        flightBooking: { include: { segments: true, passengers: true } },
      },
    });
  }

  async addDeposit(agentUserId: string, amount: number, description?: string) {
    const agent = await this.findByUserId(agentUserId);
    if (!agent) throw new NotFoundException("Agent profile not found");
    if (amount <= 0) throw new BadRequestException("Amount must be positive");

    const newBalance = Number(agent.depositBalance) + amount;

    await this.prisma.$transaction([
      this.prisma.agent.update({
        where: { id: agent.id },
        data: { depositBalance: newBalance },
      }),
      this.prisma.walletTransaction.create({
        data: {
          userId: agent.userId,
          type: WalletTransactionType.DEPOSIT,
          amount,
          balanceAfter: newBalance,
          description: description ?? "Deposit",
        },
      }),
    ]);

    return { depositBalance: newBalance };
  }
}
