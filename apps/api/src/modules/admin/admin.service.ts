import { Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, BookingType, SupplierType } from "@travel/database";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [bookings, agents, customers, suppliers, revenue] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.agent.count(),
      this.prisma.user.count({ where: { role: "CUSTOMER" } }),
      this.prisma.supplier.count({ where: { isActive: true } }),
      this.prisma.booking.aggregate({
        where: { status: { in: ["CONFIRMED", "TICKETED", "COMPLETED"] } },
        _sum: { paidAmount: true },
      }),
    ]);

    const byType = await this.prisma.booking.groupBy({
      by: ["type"],
      _count: true,
    });

    return {
      totalBookings: bookings,
      totalAgents: agents,
      totalCustomers: customers,
      totalSuppliers: suppliers,
      totalRevenue: revenue._sum.paidAmount ?? 0,
      bookingsByType: Object.fromEntries(byType.map((b) => [b.type, b._count])),
    };
  }

  listBookings(filters?: { type?: BookingType; status?: BookingStatus }) {
    return this.prisma.booking.findMany({
      where: {
        ...(filters?.type && { type: filters.type }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        agent: { select: { agencyName: true, agencyCode: true } },
        flightBooking: { include: { segments: true } },
        visaApplication: { include: { visaCountry: true } },
        umrahBooking: { include: { umrahPackage: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  updateBookingStatus(id: string, status: BookingStatus) {
    return this.prisma.booking.update({
      where: { id },
      data: { status },
    });
  }

  listAgents() {
    return this.prisma.agent.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, status: true } },
        _count: { select: { bookings: true, subAgents: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateAgent(
    id: string,
    data: { isApproved?: boolean; creditLimit?: number; commissionRate?: number },
  ) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) throw new NotFoundException("Agent not found");

    return this.prisma.agent.update({
      where: { id },
      data: {
        ...(data.isApproved !== undefined && { isApproved: data.isApproved }),
        ...(data.creditLimit !== undefined && { creditLimit: data.creditLimit }),
        ...(data.commissionRate !== undefined && { commissionRate: data.commissionRate }),
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }

  listSuppliers() {
    return this.prisma.supplier.findMany({ orderBy: { name: "asc" } });
  }

  createSupplier(data: {
    name: string;
    type: SupplierType;
    code: string;
    contactEmail?: string;
    contactPhone?: string;
  }) {
    return this.prisma.supplier.create({ data });
  }

  updateSupplier(
    id: string,
    data: Partial<{
      name: string;
      type: SupplierType;
      contactEmail: string;
      contactPhone: string;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.supplier.update({ where: { id }, data });
  }
}
