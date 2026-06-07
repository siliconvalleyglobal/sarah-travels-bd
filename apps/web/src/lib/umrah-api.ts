import { api } from "./api";

export async function getUmrahPackage(slug: string) {
  return api<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    duration: number;
    price: number;
    inclusions: string[] | null;
    exclusions: string[] | null;
    flightDetails: { airline?: string; route?: string } | null;
    hotelDetails: { makkah?: string; madinah?: string } | null;
    installments: Array<{ installmentNo: number; amount: number; dueDaysBefore: number }>;
  }>(`/umrah/packages/${slug}`);
}

export async function bookUmrah(
  token: string,
  data: {
    packageSlug: string;
    pilgrimCount: number;
    travelDate: string;
    groupName?: string;
    pilgrimDocs?: Record<string, unknown>;
    contactEmail: string;
    contactPhone: string;
  },
) {
  return api<{
    bookingId: string;
    bookingRef: string;
    status: string;
    totalAmount: number;
    downPayment: number;
    breakdown: { baseFare: number; serviceFee: number; vatAmount: number; totalAmount: number };
  }>("/umrah/book", { method: "POST", body: JSON.stringify(data), token });
}

export async function payUmrahBooking(token: string, bookingId: string, method: string) {
  return api<{
    bookingRef: string;
    status: string;
    downPaymentPaid: number;
    paymentId: string;
  }>(`/umrah/book/${bookingId}/pay`, {
    method: "POST",
    body: JSON.stringify({ method }),
    token,
  });
}
