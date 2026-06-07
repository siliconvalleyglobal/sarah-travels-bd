import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { BookingStatus, BookingType, SupplierType, UserRole } from "@travel/database";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/auth.decorators";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get("stats")
  getStats() {
    return this.adminService.getStats();
  }

  @Get("bookings")
  listBookings(
    @Query("type") type?: BookingType,
    @Query("status") status?: BookingStatus,
  ) {
    return this.adminService.listBookings({ type, status });
  }

  @Patch("bookings/:id/status")
  updateBookingStatus(
    @Param("id") id: string,
    @Body() body: { status: BookingStatus },
  ) {
    return this.adminService.updateBookingStatus(id, body.status);
  }

  @Get("agents")
  listAgents() {
    return this.adminService.listAgents();
  }

  @Patch("agents/:id")
  updateAgent(
    @Param("id") id: string,
    @Body()
    body: { isApproved?: boolean; creditLimit?: number; commissionRate?: number },
  ) {
    return this.adminService.updateAgent(id, body);
  }

  @Get("suppliers")
  listSuppliers() {
    return this.adminService.listSuppliers();
  }

  @Post("suppliers")
  createSupplier(
    @Body()
    body: {
      name: string;
      type: SupplierType;
      code: string;
      contactEmail?: string;
      contactPhone?: string;
    },
  ) {
    return this.adminService.createSupplier(body);
  }

  @Patch("suppliers/:id")
  updateSupplier(
    @Param("id") id: string,
    @Body()
    body: Partial<{
      name: string;
      type: SupplierType;
      contactEmail: string;
      contactPhone: string;
      isActive: boolean;
    }>,
  ) {
    return this.adminService.updateSupplier(id, body);
  }
}
