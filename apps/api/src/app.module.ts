import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { FlightsModule } from "./modules/flights/flights.module";
import { VisaModule } from "./modules/visa/visa.module";
import { UmrahModule } from "./modules/umrah/umrah.module";
import { AgentsModule } from "./modules/agents/agents.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { AccountingModule } from "./modules/accounting/accounting.module";
import { AdminModule } from "./modules/admin/admin.module";
import { HotelsModule } from "./modules/hotels/hotels.module";
import { ToursModule } from "./modules/tours/tours.module";
import { CarsModule } from "./modules/cars/cars.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    FlightsModule,
    VisaModule,
    UmrahModule,
    AgentsModule,
    BookingsModule,
    PaymentsModule,
    AccountingModule,
    AdminModule,
    HotelsModule,
    ToursModule,
    CarsModule,
    UploadsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
