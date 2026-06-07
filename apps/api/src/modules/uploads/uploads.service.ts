import { Injectable, NotFoundException } from "@nestjs/common";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UploadsService {
  private uploadDir = process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads");

  constructor(private prisma: PrismaService) {}

  async saveBase64File(data: { fileName: string; contentBase64: string; mimeType?: string }) {
    await mkdir(this.uploadDir, { recursive: true });
    const ext = data.fileName.split(".").pop() ?? "bin";
    const storedName = `${randomUUID()}.${ext}`;
    const filePath = join(this.uploadDir, storedName);
    const buffer = Buffer.from(data.contentBase64, "base64");
    await writeFile(filePath, buffer);
    return { fileName: data.fileName, fileUrl: `/uploads/${storedName}`, storedName };
  }

  async attachVisaDocument(data: {
    bookingId: string;
    userId: string;
    documentType: string;
    fileName: string;
    contentBase64: string;
  }) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: data.bookingId, userId: data.userId, type: "VISA" },
      include: { visaApplication: true },
    });
    if (!booking?.visaApplication) throw new NotFoundException("Visa application not found");

    const saved = await this.saveBase64File({
      fileName: data.fileName,
      contentBase64: data.contentBase64,
    });

    const doc = await this.prisma.visaDocument.create({
      data: {
        visaApplicationId: booking.visaApplication.id,
        documentType: data.documentType,
        fileName: saved.fileName,
        fileUrl: saved.fileUrl,
      },
    });

    return doc;
  }
}
