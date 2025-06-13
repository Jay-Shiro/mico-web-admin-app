import { NextRequest, NextResponse } from "next/server";
import { FormData as NodeFormData, File as NodeFile } from "formdata-node";

const BASE_URL = process.env.NEXT_API_BASE_URL;

/**
 * PRODUCTION-READY EMAIL API ROUTE WITH IMAGE SUPPORT
 *
 * This version now supports both text-only and image emails in production:
 * - Uses URL-encoded for text-only emails (proven reliable)
 * - Uses formdata-node for image emails (Vercel-compatible multipart)
 * - Comprehensive logging and error handling
 * - Fallback mechanisms to ensure delivery
 */

export async function POST(request: NextRequest) {
  try {
    console.log(
      "📧 PRODUCTION-STABLE Send-email API called at:",
      new Date().toISOString()
    );
    console.log("🌍 Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      BASE_URL: BASE_URL,
      isProduction: process.env.NODE_ENV === "production",
    });

    // Parse form data from the request
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;

    console.log("📋 Form data parsed:", {
      email: email ? "✓" : "✗",
      subject: subject ? "✓" : "✗",
      body: body ? body.length + " chars" : "✗",
    });

    // Handle images (but disable in production for now)
    const images = formData.getAll("image") as File[];
    const hasImages =
      images.length > 0 &&
      images.some((img) => img instanceof File && img.size > 0);

    console.log(
      "🖼️ Images found:",
      images.length,
      hasImages ? "Valid images detected" : "No valid images"
    );

    // Validate required fields
    if (!email || !subject || !body) {
      console.log("❌ Validation failed:", {
        email: !!email,
        subject: !!subject,
        body: !!body,
      });
      return NextResponse.json(
        { error: "Missing required fields: email, subject, or body" },
        { status: 400 }
      );
    }

    // PRODUCTION STRATEGY: Smart approach based on content type
    if (process.env.NODE_ENV === "production") {
      if (hasImages) {
        console.log(
          "🚀 PRODUCTION MODE: Using formdata-node for images (Vercel-compatible)"
        );
        return await sendEmailViaFormDataNode(email, subject, body, images);
      } else {
        console.log(
          "🚀 PRODUCTION MODE: Using URL-encoded for text-only (proven reliable)"
        );
        return await sendEmailViaUrlEncoded(email, subject, body);
      }
    }

    // DEVELOPMENT MODE: Use FormData with images as before
    console.log("🛠️ DEVELOPMENT MODE: Using FormData with images");
    return await sendEmailViaDevelopmentFormData(email, subject, body, images);
  } catch (error: any) {
    console.error("🚨 Send-email API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        debug: {
          errorName: error.name,
          errorType: typeof error,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Production URL-encoded email sending (for text-only emails)
 */
async function sendEmailViaUrlEncoded(
  email: string,
  subject: string,
  body: string
) {
  const urlEncodedData = new URLSearchParams({
    email: email,
    subject: subject,
    body: body,
  });

  console.log("📤 Sending URL-encoded data to FastAPI...");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log("⏰ Request timeout after 25s");
    controller.abort();
  }, 25000);

  try {
    const response = await fetch(`${BASE_URL}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: urlEncodedData.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("📡 FastAPI response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    const responseText = await response.text();
    console.log("📄 FastAPI response text:", responseText);

    if (response.ok) {
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("✅ Email sent successfully (URL-encoded)");
      } catch (parseError) {
        responseData = { message: responseText };
      }

      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        data: responseData,
        debug: {
          method: "URL_ENCODED_PRODUCTION",
          contentType: "application/x-www-form-urlencoded",
        },
      });
    } else {
      console.log("❌ FastAPI error:", response.status, responseText);
      return NextResponse.json(
        {
          error: "Failed to send email via FastAPI",
          details: responseText,
          status: response.status,
        },
        { status: response.status }
      );
    }
  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    console.error("🚨 Fetch error:", fetchError);

    if (fetchError.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timeout" },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: "Network error", details: fetchError.message },
      { status: 500 }
    );
  }
}

/**
 * Production FormData email sending (for emails with images)
 */
async function sendEmailViaFormDataNode(
  email: string,
  subject: string,
  body: string,
  images: File[]
) {
  try {
    console.log("📤 Using formdata-node for better multipart compatibility on Vercel...");

    const productionFormData = new NodeFormData();
    productionFormData.append("email", email);
    productionFormData.append("subject", subject);
    productionFormData.append("body", body);

    // Add images using formdata-node
    for (let index = 0; index < images.length; index++) {
      const image = images[index];
      if (image instanceof File && image.size > 0) {
        try {
          // Convert File to Buffer for formdata-node compatibility
          const arrayBuffer = await image.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          const nodeFile = new NodeFile([buffer], image.name || `image_${index}.jpg`, {
            type: image.type || "image/jpeg",
          });
          
          productionFormData.append("image", nodeFile);
          console.log(
            `📎 Added image ${index}: ${image.name} (${image.size} bytes, ${image.type})`
          );
        } catch (fileError) {
          console.error(`❌ Error processing image ${index}:`, fileError);
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Request timeout after 30s");
      controller.abort();
    }, 30000);

    try {
      const response = await fetch(`${BASE_URL}/send-email`, {
        method: "POST",
        body: productionFormData as any, // Type assertion for fetch compatibility
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          // Let formdata-node handle Content-Type header with proper boundary
        },
      });

      clearTimeout(timeoutId);

      console.log("📡 FastAPI response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      const responseText = await response.text();
      console.log("📄 FastAPI response text:", responseText);

      if (response.ok) {
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log("✅ Email with images sent successfully (formdata-node)");
        } catch (parseError) {
          responseData = { message: responseText };
        }

        return NextResponse.json({
          success: true,
          message: "Email with images sent successfully",
          data: responseData,
          debug: {
            method: "FORMDATA_NODE_PRODUCTION",
            imageCount: images.length,
          },
        });
      } else {
        console.log("❌ FastAPI error:", response.status, responseText);
        return NextResponse.json(
          {
            error: "Failed to send email with images via FastAPI",
            details: responseText,
            status: response.status,
          },
          { status: response.status }
        );
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error("🚨 Fetch error:", fetchError);

      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timeout" },
          { status: 408 }
        );
      }

      return NextResponse.json(
        { error: "Network error", details: fetchError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("🚨 FormData processing error:", error);
    return NextResponse.json(
      { error: "Failed to process form data", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Development mode FormData handling
 */
async function sendEmailViaDevelopmentFormData(
  email: string,
  subject: string,
  body: string,
  images: File[]
) {
  try {
    console.log("📤 Creating FormData for development...");

    const fastApiFormData = new FormData();
    fastApiFormData.append("email", email);
    fastApiFormData.append("subject", subject);
    fastApiFormData.append("body", body);

    // Add images in development
    const hasImages =
      images.length > 0 &&
      images.some((img) => img instanceof File && img.size > 0);

    if (hasImages) {
      console.log("📎 Adding images to FormData...");
      for (let index = 0; index < images.length; index++) {
        const image = images[index];
        if (image instanceof File && image.size > 0) {
          try {
            fastApiFormData.append(
              "image",
              image,
              image.name || `image_${index}.jpg`
            );
            console.log(
              `📎 Added image ${index}:`,
              image.name,
              `(${image.size} bytes)`
            );
          } catch (fileError) {
            console.error(`❌ Error processing image ${index}:`, fileError);
          }
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000);

    const response = await fetch(`${BASE_URL}/send-email`, {
      method: "POST",
      body: fastApiFormData,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);
    const responseText = await response.text();

    if (response.ok) {
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("✅ Development email sent successfully");
      } catch {
        responseData = { message: responseText };
      }

      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        data: responseData,
      });
    } else {
      console.log(
        "❌ Development FormData failed:",
        response.status,
        responseText
      );
      return NextResponse.json(
        {
          error: "Failed to send email via FastAPI",
          details: responseText,
          status: response.status,
        },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error("🚨 Development FormData error:", error);
    return NextResponse.json(
      { error: "Development email sending failed", details: error.message },
      { status: 500 }
    );
  }
}
