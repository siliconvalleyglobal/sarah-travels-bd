import { api } from "./api";

export async function uploadVisaDocument(
  token: string,
  data: { bookingId: string; documentType: string; fileName: string; contentBase64: string },
) {
  return api<{ id: string; fileName: string; fileUrl: string }>("/uploads/visa", {
    method: "POST", body: JSON.stringify(data), token,
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
