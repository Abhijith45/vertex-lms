import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { issueCertificate } from "@/lib/certificate";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    const body = await req.json();
    const { courseSlug, courseTitle, skills, totalLessons } = body;

    if (!courseSlug || !courseTitle) {
      return NextResponse.json(
        { error: "courseSlug and courseTitle are required" },
        { status: 400 }
      );
    }

    const recipientUserId = userId || "anonymous-learner";
    const recipientName =
      user?.fullName ||
      (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : null) ||
      "Abhijeet Rawat";
    const recipientEmail = user?.primaryEmailAddress?.emailAddress;

    const cert = issueCertificate({
      userId: recipientUserId,
      userName: recipientName,
      userEmail: recipientEmail,
      courseSlug,
      courseTitle,
      skills,
      totalLessons,
    });

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: recipientUserId,
      event: "certificate_issued",
      properties: {
        certificate_id: cert.id,
        course_slug: courseSlug,
        course_title: courseTitle,
        issued_at: cert.issuedAt,
      },
    });

    return NextResponse.json({
      success: true,
      certificate: cert,
      verificationUrl: `/verify/${cert.id}`,
    });
  } catch (err: unknown) {
    console.error("Error issuing certificate:", err);
    return NextResponse.json(
      { error: "Failed to issue certificate" },
      { status: 500 }
    );
  }
}
