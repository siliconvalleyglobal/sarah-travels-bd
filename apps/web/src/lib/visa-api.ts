import { api } from "./api";

export async function getVisaCountry(code: string) {
  return api<{
    id: string;
    name: string;
    code: string;
    description: string | null;
    processingDays: number | null;
    fee: number;
    requirements: { documents?: string[] } | null;
  }>(`/visa/countries/${code}`);
}

export async function applyVisa(
  token: string,
  data: {
    countryCode: string;
    travelDate?: string;
    firstName: string;
    lastName: string;
    passportNumber: string;
    passportExpiry?: string;
    email: string;
    phone: string;
  },
) {
  return api<{
    bookingId: string;
    bookingRef: string;
    status: string;
    totalAmount: number;
    breakdown: { baseFee: number; serviceFee: number; vatAmount: number; totalAmount: number };
  }>("/visa/applications", { method: "POST", body: JSON.stringify(data), token });
}

export async function payVisaApplication(token: string, bookingId: string, method: string) {
  return api<{
    bookingRef: string;
    status: string;
    paymentId: string;
  }>(`/visa/applications/${bookingId}/pay`, {
    method: "POST",
    body: JSON.stringify({ method }),
    token,
  });
}
