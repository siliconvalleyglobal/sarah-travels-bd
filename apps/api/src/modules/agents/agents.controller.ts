import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { FlightClass, TripType, UserRole } from "@travel/database";
import { AgentsService } from "./agents.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, CurrentUser } from "../../common/decorators/auth.decorators";

@Controller("agents")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AGENT, UserRole.SUB_AGENT)
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Get("dashboard")
  getDashboard(@CurrentUser() user: { id: string }) {
    return this.agentsService.getDashboard(user.id);
  }

  @Get("profile")
  getProfile(@CurrentUser() user: { id: string }) {
    return this.agentsService.findByUserId(user.id);
  }

  @Get("bookings")
  getBookings(@CurrentUser() user: { id: string }) {
    return this.agentsService.getBookings(user.id);
  }

  @Get("wallet")
  getWallet(@CurrentUser() user: { id: string }) {
    return this.agentsService.getWallet(user.id);
  }

  @Post("bookings/flight")
  bookFlight(
    @CurrentUser() user: { id: string },
    @Body()
    body: {
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
        departureAt: string;
        arrivalAt: string;
        duration?: number;
      }>;
      passengers: Array<{
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: string;
        passportNumber?: string;
        passportExpiry?: string;
      }>;
    },
  ) {
    return this.agentsService.bookFlightWithCredit(user.id, {
      ...body,
      segments: body.segments.map((s) => ({
        ...s,
        departureAt: new Date(s.departureAt),
        arrivalAt: new Date(s.arrivalAt),
      })),
      passengers: body.passengers.map((p) => ({
        ...p,
        dateOfBirth: new Date(p.dateOfBirth),
        passportExpiry: p.passportExpiry ? new Date(p.passportExpiry) : undefined,
      })),
    });
  }

  @Post("wallet/deposit")
  addDeposit(
    @CurrentUser() user: { id: string },
    @Body() body: { amount: number; description?: string },
  ) {
    return this.agentsService.addDeposit(user.id, body.amount, body.description);
  }
}
