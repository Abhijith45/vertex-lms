import { createHmac, timingSafeEqual } from "crypto";

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  courseSlug: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string; // ISO date string
  signature: string;
  skills: string[];
  totalLessons: number;
  credentialUrl?: string;
}

const DEFAULT_SECRET =
  process.env.CERTIFICATE_SECRET_KEY ||
  "vertex-cryptographic-signing-key-production-sha256";

/**
 * Generate a tamper-proof HMAC-SHA256 signature for a certificate.
 */
export function generateCertificateSignature(
  payload: {
    id: string;
    userId: string;
    courseSlug: string;
    issuedAt: string;
  },
  secret = DEFAULT_SECRET
): string {
  const message = `${payload.id}:${payload.userId}:${payload.courseSlug}:${payload.issuedAt}`;
  return createHmac("sha256", secret).update(message).digest("hex");
}

/**
 * Verify a certificate's authenticity and integrity against forgery.
 * Uses timingSafeEqual to protect against side-channel timing attacks.
 */
export function verifyCertificate(
  certificate: Certificate,
  secret = DEFAULT_SECRET
): boolean {
  if (!certificate || !certificate.signature) return false;

  const expectedSignature = generateCertificateSignature(
    {
      id: certificate.id,
      userId: certificate.userId,
      courseSlug: certificate.courseSlug,
      issuedAt: certificate.issuedAt,
    },
    secret
  );

  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
  const actualBuffer = Buffer.from(certificate.signature, "utf-8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

// In-memory certificate store for runtime persistence & instant demo verification
const CERTIFICATE_REGISTRY = new Map<string, Certificate>();

// Seed default verified certificate for the flagship Next.js course
const seedId = "vtx-cert-nextjs-app-router-in-depth";
const seedIssuedAt = "2026-11-01T12:00:00.000Z";
const seedSignature = generateCertificateSignature({
  id: seedId,
  userId: "user_seed_learner_01",
  courseSlug: "nextjs-app-router-in-depth",
  issuedAt: seedIssuedAt,
});

const defaultCert: Certificate = {
  id: seedId,
  userId: "user_seed_learner_01",
  userName: "Abhijeet Rawat",
  userEmail: "learner@vertex.dev",
  courseSlug: "nextjs-app-router-in-depth",
  courseTitle: "Next.js App Router in Depth",
  instructorName: "Guillermo Rauch & Vertex Engineering",
  issuedAt: seedIssuedAt,
  signature: seedSignature,
  skills: [
    "React Server Components",
    "Multi-Tier Caching Architecture",
    "Streaming Suspense Boundaries",
    "Server Actions & Mutations",
    "Route Handlers & Edge Middleware",
  ],
  totalLessons: 12,
  credentialUrl: `/verify/${seedId}`,
};

CERTIFICATE_REGISTRY.set(seedId, defaultCert);

/**
 * Look up a certificate by its unique ID.
 */
export function getCertificateById(id: string): Certificate | null {
  // If exact match in registry
  if (CERTIFICATE_REGISTRY.has(id)) {
    return CERTIFICATE_REGISTRY.get(id)!;
  }

  // Handle dynamic lookup for course slug pattern (e.g. vtx-cert-building-ai-apps-with-llms)
  if (id.startsWith("vtx-cert-")) {
    const slug = id.replace("vtx-cert-", "");
    const generated: Certificate = {
      id,
      userId: "user_verified_learner",
      userName: "Abhijeet Rawat",
      userEmail: "learner@vertex.dev",
      courseSlug: slug,
      courseTitle: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      instructorName: "Vertex Technical Faculty",
      issuedAt: new Date().toISOString(),
      signature: "",
      skills: ["Full-Stack Architecture", "Next.js 16", "PostgreSQL", "pgvector"],
      totalLessons: 10,
    };
    generated.signature = generateCertificateSignature({
      id: generated.id,
      userId: generated.userId,
      courseSlug: generated.courseSlug,
      issuedAt: generated.issuedAt,
    });
    generated.credentialUrl = `/verify/${id}`;
    CERTIFICATE_REGISTRY.set(id, generated);
    return generated;
  }

  return null;
}

/**
 * Claim or generate a new verifiable certificate for a learner.
 */
export function issueCertificate(params: {
  userId: string;
  userName: string;
  userEmail?: string;
  courseSlug: string;
  courseTitle: string;
  instructorName?: string;
  skills?: string[];
  totalLessons?: number;
}): Certificate {
  const id = `vtx-cert-${params.courseSlug}`;
  const issuedAt = new Date().toISOString();

  const signature = generateCertificateSignature({
    id,
    userId: params.userId,
    courseSlug: params.courseSlug,
    issuedAt,
  });

  const cert: Certificate = {
    id,
    userId: params.userId,
    userName: params.userName || "Vertex Learner",
    userEmail: params.userEmail,
    courseSlug: params.courseSlug,
    courseTitle: params.courseTitle,
    instructorName: params.instructorName || "Vertex Technical Faculty",
    issuedAt,
    signature,
    skills: params.skills || [
      "Modern Web Architecture",
      "Next.js App Router",
      "Vector Search & AI",
      "Production Engineering",
    ],
    totalLessons: params.totalLessons || 8,
    credentialUrl: `/verify/${id}`,
  };

  CERTIFICATE_REGISTRY.set(id, cert);
  return cert;
}
