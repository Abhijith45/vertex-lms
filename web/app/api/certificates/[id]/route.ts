import { NextResponse } from "next/server";
import { getCertificateById, verifyCertificate } from "@/lib/certificate";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Certificate ID is required" }, { status: 400 });
    }

    const certificate = getCertificateById(id);
    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    const isValid = verifyCertificate(certificate);

    return NextResponse.json({
      certificate,
      isValid,
      verification: {
        algorithm: "HMAC-SHA256",
        verifiedAt: new Date().toISOString(),
        issuer: "Vertex Learning Inc.",
        registryStatus: isValid ? "AUTHENTIC_VERIFIED" : "TAMPERED_INVALID",
      },
    });
  } catch (error: unknown) {
    console.error("Error retrieving certificate:", error);
    return NextResponse.json(
      { error: "Internal server error retrieving certificate" },
      { status: 500 }
    );
  }
}
