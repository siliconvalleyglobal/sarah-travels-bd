import { Module } from "@nestjs/common";
import { UmrahService } from "./umrah.service";
import { UmrahController } from "./umrah.controller";

@Module({
  controllers: [UmrahController],
  providers: [UmrahService],
})
export class UmrahModule {}
