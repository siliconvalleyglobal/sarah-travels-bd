import { Module } from "@nestjs/common";
import { AgentsService } from "./agents.service";
import { AgentsController } from "./agents.controller";
import { FlightsModule } from "../flights/flights.module";

@Module({
  imports: [FlightsModule],
  controllers: [AgentsController],
  providers: [AgentsService],
})
export class AgentsModule {}
