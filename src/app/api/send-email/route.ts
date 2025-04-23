import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.recipients || body.recipients.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          detail: [{ msg: "Recipients are required" }],
        },
        { status: 422 }
      );
    }

    // Track successful and failed emails
    const results = {
      successful: [] as string[],
      failed: [] as { email: string; reason: string }[],
      total: body.recipients.length,
    };

    // Process emails in batches to avoid overloading the API
    const batchSize = 5; // Process 5 emails at a time
    for (let i = 0; i < body.recipients.length; i += batchSize) {
      const batch = body.recipients.slice(i, i + batchSize);

      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(async (recipient: any) => {
          const response = await fetch(`${BASE_URL}/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: recipient.email,
              subject: recipient.subject,
              body: recipient.body,
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(
              `Failed to send email to ${recipient.email}: ${error}`
            );
          }

          return recipient.email;
        })
      );

      // Process batch results
      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.successful.push(result.value);
        } else {
          results.failed.push({
            email: batch[index].email,
            reason: result.reason.message || "Unknown error",
          });
        }
      });

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < body.recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      status: "success",
      message: `Email broadcast complete. ${results.successful.length}/${results.total} emails sent successfully.`,
      results,
    });
  } catch (error: any) {
    console.error("Send email error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to send emails",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}
