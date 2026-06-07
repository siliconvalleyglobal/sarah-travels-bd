import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { UploadsService } from "./uploads.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/auth.decorators";

@Controller("uploads")
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  upload(@Body() body: { fileName: string; contentBase64: string; mimeType?: string }) {
    return this.uploadsService.saveBase64File(body);
  }

  @Post("visa")
  @UseGuards(JwtAuthGuard)
  uploadVisaDoc(
    @CurrentUser() user: { id: string },
    @Body() body: { bookingId: string; documentType: string; fileName: string; contentBase64: string },
  ) {
    return this.uploadsService.attachVisaDocument({ userId: user.id, ...body });
  }
}
