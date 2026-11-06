"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Printer,
  Copy,
  Check,
  Award,
  Key,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { VertexLogo } from "@/components/home/vertex-logo";
import type { Certificate } from "@/lib/certificate";

interface CertificateViewProps {
  certificate: Certificate;
  isValid: boolean;
}

export function CertificateView({ certificate, isValid }: CertificateViewProps) {
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const certDateObj = new Date(certificate.issuedAt);
  const issueYear = certDateObj.getFullYear();
  const issueMonth = certDateObj.getMonth() + 1;

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://vertex.dev/verify/${certificate.id}`;

  const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    certificate.courseTitle
  )}&organizationName=Vertex+Learning&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
    currentUrl
  )}&certId=${encodeURIComponent(certificate.id)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* ──────────────────────────────────────────────────────────
         TOP ACTION & NAVIGATION BAR (Hidden in Print)
         ────────────────────────────────────────────────────────── */}
      <div className="print:hidden mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/my-learning"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>My Learning</span>
          </Link>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Official Credential Verification
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0A66C2] hover:bg-[#084e96] text-white transition-colors cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Add to LinkedIn</span>
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E05A36] hover:bg-[#C2410C] text-white transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
         CRYPTOGRAPHIC STATUS BANNER
         ────────────────────────────────────────────────────────── */}
      <div
        className={`print:hidden mb-6 rounded-2xl border p-4 flex items-center gap-3.5 shadow-xs ${
          isValid
            ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200"
            : "bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-800/60 text-red-900 dark:text-red-200"
        }`}
      >
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
            isValid
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex-1 text-xs leading-relaxed">
          <div className="font-bold text-sm">
            {isValid
              ? "Cryptographically Verified Authentic"
              : "Invalid / Tampered Credential Signature"}
          </div>
          <div className="opacity-90">
            {isValid
              ? `This certificate record was signed with HMAC-SHA256 and verified against the Vertex tamper-proof credential registry.`
              : `Warning: This certificate signature does not match the computed hash. It may have been forged or altered.`}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
         OFFICIAL CERTIFICATE CANVAS (PRINTABLE)
         ────────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl border-8 border-double border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#0D131F] p-8 sm:p-14 shadow-xl overflow-hidden print:border-8 print:shadow-none print:m-0 print:p-10">
        {/* Subtle Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.04] pointer-events-none select-none">
          <VertexLogo className="w-[500px] h-[500px]" />
        </div>

        {/* Top Header */}
        <div className="text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <VertexLogo className="h-10 w-10" />
            <span className="font-sans text-2xl font-black tracking-tight text-neutral-900 dark:text-white uppercase">
              Vertex
            </span>
          </div>

          <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#E05A36] mb-1">
            Official Credential Registry
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Certificate of Mastery & Completion
          </h1>
        </div>

        {/* Recipient Section */}
        <div className="text-center my-8 sm:my-10 relative z-10">
          <p className="text-xs sm:text-sm font-serif italic text-neutral-500 dark:text-neutral-400 mb-2">
            This certifies that
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#E05A36] tracking-tight pb-2 border-b-2 border-[#E05A36]/30 max-w-lg mx-auto">
            {certificate.userName}
          </h2>
          <p className="text-xs sm:text-sm font-serif italic text-neutral-500 dark:text-neutral-400 mt-4 max-w-xl mx-auto leading-relaxed">
            has demonstrated advanced competency and successfully completed all rigorous engineering requirements and interactive labs for:
          </p>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-3 tracking-tight">
            {certificate.courseTitle}
          </h3>
        </div>

        {/* Competencies & Skills */}
        {certificate.skills && certificate.skills.length > 0 && (
          <div className="my-6 relative z-10">
            <p className="text-[11px] font-mono uppercase text-center tracking-wider text-neutral-400 mb-2.5">
              Verified Technical Competencies
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {certificate.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60 print:border print:bg-white"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Signatures & Seal Grid */}
        <div className="mt-12 pt-8 border-t border-neutral-200/80 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-3 items-center gap-8 text-center relative z-10">
          {/* Issue Date */}
          <div>
            <div className="font-display text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {formattedDate}
            </div>
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mt-0.5">
              Date Issued
            </div>
          </div>

          {/* Golden / Orange Embossed Crest */}
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#E05A36] bg-[#E05A36]/10 flex items-center justify-center shadow-inner">
              <Award className="h-8 w-8 text-[#E05A36]" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#E05A36] mt-1.5">
              Verified Issuer
            </span>
          </div>

          {/* Instructor Accreditation */}
          <div>
            <div className="font-display text-sm font-bold text-neutral-900 dark:text-neutral-100 italic">
              {certificate.instructorName}
            </div>
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mt-0.5">
              Faculty Accreditation
            </div>
          </div>
        </div>

        {/* Cryptographic Metadata Footer */}
        <div className="mt-8 pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-1.5 truncate">
            <Key className="h-3 w-3 text-[#E05A36] shrink-0" />
            <span className="truncate">
              SHA-256: {certificate.signature.slice(0, 32)}...
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-neutral-600 dark:text-neutral-300">
              ID: {certificate.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
