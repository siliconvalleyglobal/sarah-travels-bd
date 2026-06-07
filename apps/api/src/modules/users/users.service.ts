import { Injectable } from "@nestjs/common";
import { UserRole, UserStatus } from "@travel/database";
import { PrismaService } from "../../prisma/prisma.service";

interface CreateUserInput {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true, travellerProfiles: true },
    });
  }

  create(data: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role ?? UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    });
  }
}
