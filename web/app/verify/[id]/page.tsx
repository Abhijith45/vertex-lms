import React from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CertificateView } from "@/components/certificate/certificate-view";
import { getCertificateById, verifyCertificate } from "@/lib/certificate";

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: VerifyPageProps) {
  const { id } = await params;
  const cert = getCertificateById(id);

  if (!cert) {
    return {
      title: "Certificate Verification — Vertex",
      description: "Verify authentic credentials and course completions on Vertex.",
    };
  }

  return {
    title: `Certificate: ${cert.userName} - ${cert.courseTitle} | Vertex Registry`,
    description: `Official verified completion certificate awarded to ${cert.userName} for mastering ${cert.courseTitle}. Cryptographically verified with HMAC-SHA256.`,
    openGraph: {
      title: `Verified Certificate: ${cert.courseTitle}`,
      description: `Awarded to ${cert.userName} on Vertex Learning Registry.`,
      type: "article",
    },
  };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = await params;
  const certificate = getCertificateById(id);

  if (!certificate) {
    notFound();
  }

  const isValid = verifyCertificate(certificate);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/60 dark:bg-[#090D16] text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="print:hidden">
        <Navbar showSearch={false} />
      </div>

      <main className="flex-1 py-4 sm:py-10">
        <CertificateView certificate={certificate} isValid={isValid} />
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
