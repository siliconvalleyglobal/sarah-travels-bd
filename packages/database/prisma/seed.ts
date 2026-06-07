import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../../.env") });

import { PrismaClient, AccountType, UserRole, UserStatus, SupplierType } from "../src/generated/prisma/client";
import { createPrismaAdapter } from "../src/index";
import * as bcrypt from "bcrypt";
import { HOTELS_SEED } from "./hotels-seed";
import { TOURS_SEED } from "./tours-seed";
import { CARS_SEED } from "./cars-seed";

const prisma = new PrismaClient({ adapter: createPrismaAdapter() });

async function main() {
  // Chart of accounts
  const accounts = [
    { code: "1000", name: "Cash", type: AccountType.ASSET },
    { code: "1100", name: "Bank", type: AccountType.ASSET },
    { code: "1200", name: "Accounts Receivable", type: AccountType.ASSET },
    { code: "2000", name: "Accounts Payable", type: AccountType.LIABILITY },
    { code: "2100", name: "Agent Deposits", type: AccountType.LIABILITY },
    { code: "3000", name: "Owner's Equity", type: AccountType.EQUITY },
    { code: "4000", name: "Flight Revenue", type: AccountType.REVENUE },
    { code: "4100", name: "Visa Revenue", type: AccountType.REVENUE },
    { code: "4200", name: "Umrah Revenue", type: AccountType.REVENUE },
    { code: "5000", name: "Supplier Cost", type: AccountType.EXPENSE },
    { code: "5100", name: "Agent Commission", type: AccountType.EXPENSE },
    { code: "5200", name: "Operating Expenses", type: AccountType.EXPENSE },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { code: account.code },
      update: {},
      create: account,
    });
  }

  // Visa countries
  const visaCountries = [
    {
      name: "United Arab Emirates",
      code: "AE",
      description: "Tourist visa for UAE. Single and multiple entry available.",
      processingDays: 5,
      fee: 8500,
      requirements: {
        documents: ["Passport (6+ months validity)", "Photo", "Bank statement", "NOC"],
      },
    },
    {
      name: "Saudi Arabia",
      code: "SA",
      description: "Umrah and tourist visa for Saudi Arabia.",
      processingDays: 7,
      fee: 12000,
      requirements: {
        documents: ["Passport", "Photo", "Meningitis certificate", "Return ticket"],
      },
    },
    {
      name: "Malaysia",
      code: "MY",
      description: "eVisa for Malaysia tourism and business.",
      processingDays: 3,
      fee: 4500,
      requirements: {
        documents: ["Passport", "Photo", "Return ticket", "Hotel booking"],
      },
    },
    {
      name: "Thailand",
      code: "TH",
      description: "Tourist visa for Thailand.",
      processingDays: 5,
      fee: 5500,
      requirements: {
        documents: ["Passport", "Photo", "Bank statement", "Itinerary"],
      },
    },
    {
      name: "United States",
      code: "US",
      description: "B1/B2 tourist and business visa.",
      processingDays: 30,
      fee: 18500,
      requirements: {
        documents: ["Passport", "DS-160 confirmation", "Photo", "Bank statement", "Employment letter"],
      },
    },
  ];

  for (const country of visaCountries) {
    await prisma.visaCountry.upsert({
      where: { code: country.code },
      update: country,
      create: country,
    });
  }

  // Umrah packages
  const umrahPackages = [
    {
      title: "Economy Umrah — 7 Days",
      slug: "economy-umrah-7d",
      description: "Budget-friendly Umrah package with 3-star hotel near Haram.",
      duration: 7,
      price: 95000,
      inclusions: ["Return flights", "3-star hotel (Makkah & Madinah)", "Visa", "Transport", "Ziyarat"],
      exclusions: ["Personal expenses", "Extra meals"],
      flightDetails: { airline: "SV", route: "DAC-JED-DAC" },
      hotelDetails: { makkah: "3-star, 500m from Haram", madinah: "3-star, 800m from Haram" },
    },
    {
      title: "Standard Umrah — 10 Days",
      slug: "standard-umrah-10d",
      description: "Popular 10-day package with 4-star hotels and guided Ziyarat.",
      duration: 10,
      price: 145000,
      inclusions: ["Return flights", "4-star hotel", "Visa", "AC transport", "Guided Ziyarat", "Laundry"],
      exclusions: ["Personal shopping", "Room service"],
      flightDetails: { airline: "BG", route: "DAC-JED-MED-DAC" },
      hotelDetails: { makkah: "4-star, 300m from Haram", madinah: "4-star, 400m from Haram" },
    },
    {
      title: "Premium Umrah — 14 Days",
      slug: "premium-umrah-14d",
      description: "Luxury Umrah with 5-star hotels, business class option, and VIP services.",
      duration: 14,
      price: 285000,
      inclusions: ["Return flights (Business optional)", "5-star hotel", "Visa", "VIP transport", "Private guide", "All meals"],
      exclusions: ["Business class upgrade surcharge"],
      flightDetails: { airline: "EK", route: "DAC-JED-MED-DAC" },
      hotelDetails: { makkah: "5-star, Haram view", madinah: "5-star, Prophet's Mosque view" },
    },
  ];

  for (const pkg of umrahPackages) {
    await prisma.umrahPackage.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: {
        ...pkg,
        installments: {
          create: [
            { installmentNo: 1, amount: pkg.price * 0.3, dueDaysBefore: 60 },
            { installmentNo: 2, amount: pkg.price * 0.3, dueDaysBefore: 30 },
            { installmentNo: 3, amount: pkg.price * 0.4, dueDaysBefore: 7 },
          ],
        },
      },
    });
  }

  // Hotels
  for (const hotel of HOTELS_SEED) {
    const { rooms, reviews, images, ...hotelData } = hotel;
    await prisma.hotel.upsert({
      where: { slug: hotel.slug },
      update: {},
      create: {
        ...hotelData,
        amenities: hotel.amenities,
        images: {
          create: images.map((url, i) => ({ url, sortOrder: i })),
        },
        rooms: { create: rooms },
        reviews: { create: reviews },
      },
    });
  }

  for (const tour of TOURS_SEED) {
    await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: {},
      create: tour,
    });
  }

  for (const car of CARS_SEED) {
    await prisma.carVehicle.upsert({
      where: { slug: car.slug },
      update: {},
      create: car,
    });
  }

  // Demo users (password: password123)
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@travel.com" },
    update: {},
    create: {
      email: "admin@travel.com",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { email: "agent@travel.com" },
    update: {},
    create: {
      email: "agent@travel.com",
      passwordHash,
      firstName: "Demo",
      lastName: "Agent",
      phone: "+8801700000000",
      role: UserRole.AGENT,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.agent.upsert({
    where: { userId: agentUser.id },
    update: { isApproved: true, creditLimit: 500000, commissionRate: 5 },
    create: {
      userId: agentUser.id,
      agencyName: "Demo Travel Agency",
      agencyCode: "AGDEMO1",
      isApproved: true,
      creditLimit: 500000,
      commissionRate: 5,
      depositBalance: 50000,
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@travel.com" },
    update: { status: UserStatus.ACTIVE },
    create: {
      email: "customer@travel.com",
      passwordHash,
      firstName: "Jamil",
      lastName: "Khan",
      phone: "+8801711111111",
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  // Suppliers
  const suppliers = [
    { name: "Biman Bangladesh Airlines", type: SupplierType.AIRLINE, code: "BG" },
    { name: "Emirates", type: SupplierType.AIRLINE, code: "EK" },
    { name: "Amadeus GDS", type: SupplierType.CONSOLIDATOR, code: "AMD" },
    { name: "Saudi Visa Center", type: SupplierType.VISA_PARTNER, code: "SVC" },
  ];

  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { code: supplier.code },
      update: {},
      create: supplier,
    });
  }

  console.log("Seed completed:");
  console.log("  Admin: admin@travel.com / password123");
  console.log("  Agent: agent@travel.com / password123");
  console.log("  Customer: customer@travel.com / password123");
  console.log(`  Hotels seeded: ${HOTELS_SEED.length}`);
  console.log(`  Tours seeded: ${TOURS_SEED.length}`);
  console.log(`  Cars seeded: ${CARS_SEED.length}`);
  console.log(`  Admin user id: ${admin.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
