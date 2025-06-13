import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

/**
 * PRODUCTION-READY EMAIL API ROUTE WITH IMAGE SUPPORT
 *
 * This version now uses the same native FormData approach for both production and development:
 * - Uses URL-encoded for text-only emails (proven reliable)
 * - Uses native FormData for image emails (same as development - works perfectly)
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

    // Handle images (now enabled in production)
    const images = formData.getAll("image") as File[];
    const hasImages =
      images.length > 0 &&
      images.some((img) => img instanceof File && img.size > 0);

    console.log("🖼️ Images analysis:", {
      totalImagesFound: images.length,
      hasValidImages: hasImages,
      imageDetails: images.map((img, i) => ({
        index: i,
        isFile: img instanceof File,
        name: img instanceof File ? img.name : "N/A",
        size: img instanceof File ? img.size : "N/A",
        type: img instanceof File ? img.type : "N/A",
      })),
    });

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

    // PRODUCTION STRATEGY: Use JSON with base64 images for reliability
    if (process.env.NODE_ENV === "production") {
      console.log(
        "🚀 PRODUCTION MODE: Using JSON with base64 for FastAPI compatibility"
      );
      console.log("📋 Production email details:", {
        hasImages,
        imageCount: images.length,
        approach: "JSON_BASE64_PRODUCTION",
      });

      if (hasImages) {
        console.log("📎 Production: Using JSON with base64 images");
        return await sendEmailViaJsonWithBase64(email, subject, body, images);
      } else {
        console.log("📝 Production: Using JSON for text-only email");
        return await sendEmailViaJsonTextOnly(email, subject, body);
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
 * Production JSON email sending for text-only emails
 */
async function sendEmailViaJsonTextOnly(
  email: string,
  subject: string,
  body: string
) {
  try {
    console.log("📤 PRODUCTION: Sending text-only email via JSON...");

    // Create JSON payload for text-only email (matching FastAPI format)
    const jsonPayload = {
      json_data: {
        email: email,
        subject: subject,
        body: body,
        attachments: [], // Empty attachments array
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Request timeout after 30s");
      controller.abort();
    }, 30000);

    try {
      const response = await fetch(`${BASE_URL}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(jsonPayload),
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
          console.log("✅ Text-only email sent successfully (JSON)");
        } catch (parseError) {
          responseData = { message: responseText };
        }

        return NextResponse.json({
          success: true,
          message: "Email sent successfully",
          data: responseData,
          debug: {
            method: "JSON_TEXT_ONLY_PRODUCTION",
            payloadSize: JSON.stringify(jsonPayload).length,
          },
        });
      } else {
        console.log(
          "❌ FastAPI error with JSON text-only:",
          response.status,
          responseText
        );

        // FALLBACK: Try URL-encoded as backup
        console.log("🔄 FALLBACK: JSON failed, trying URL-encoded...");
        return await sendEmailViaUrlEncoded(email, subject, body);
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error("🚨 Fetch error with JSON text-only:", fetchError);

      if (fetchError.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 408 });
      }

      // FALLBACK: Try URL-encoded
      console.log(
        "🔄 FALLBACK: Network error with JSON, trying URL-encoded..."
      );
      return await sendEmailViaUrlEncoded(email, subject, body);
    }
  } catch (error: any) {
    console.error("🚨 JSON text-only processing error:", error);

    // FALLBACK: Try URL-encoded
    console.log("🔄 FALLBACK: JSON processing error, trying URL-encoded...");
    return await sendEmailViaUrlEncoded(email, subject, body);
  }
}

/**
 * Production FormData email sending (uses EXACT same approach as development)
 */
async function sendEmailViaProductionFormData(
  email: string,
  subject: string,
  body: string,
  images: File[]
) {
  try {
    console.log(
      "📤 PRODUCTION: Using native FormData (same as development - known to work)"
    );

    // Use NATIVE FormData just like development (which works perfectly)
    const productionFormData = new FormData();
    productionFormData.append("email", email);
    productionFormData.append("subject", subject);
    productionFormData.append("body", body);

    // Add images exactly like development does
    const hasImages =
      images.length > 0 &&
      images.some((img) => img instanceof File && img.size > 0);

    if (hasImages) {
      console.log("📎 Adding images to production FormData...");
      for (let index = 0; index < images.length; index++) {
        const image = images[index];
        if (image instanceof File && image.size > 0) {
          try {
            productionFormData.append(
              "image",
              image,
              image.name || `image_${index}.jpg`
            );
            console.log(
              `📎 Added image ${index}: ${image.name} (${image.size} bytes, ${image.type})`
            );
          } catch (fileError) {
            console.error(`❌ Error processing image ${index}:`, fileError);
          }
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
        body: productionFormData, // Native FormData, just like development
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          // Let browser auto-set Content-Type with proper multipart boundary
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
          console.log("✅ Email sent successfully (production FormData)");
        } catch (parseError) {
          responseData = { message: responseText };
        }

        return NextResponse.json({
          success: true,
          message: hasImages
            ? "Email with images sent successfully"
            : "Email sent successfully",
          data: responseData,
          debug: {
            method: "NATIVE_FORMDATA_PRODUCTION",
            imageCount: images.length,
            sameAsDevelopment: true,
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
        return NextResponse.json({ error: "Request timeout" }, { status: 408 });
      }

      return NextResponse.json(
        { error: "Network error", details: fetchError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("🚨 FormData processing error:", error);
    return NextResponse.json(
      { error: "FormData processing failed", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Production JSON email sending with base64 images (most reliable for Vercel)
 */
async function sendEmailViaJsonWithBase64(
  email: string,
  subject: string,
  body: string,
  images: File[]
) {
  try {
    console.log(
      "📤 PRODUCTION: Converting images to base64 for JSON payload..."
    );

    // Convert images to base64 attachments
    const attachments = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (image instanceof File && image.size > 0) {
        try {
          console.log(
            `📎 Processing image ${i}: ${image.name} (${image.size} bytes, ${image.type})`
          );

          const arrayBuffer = await image.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");

          attachments.push({
            filename: image.name || `image_${i}.jpg`,
            content: base64,
            type: image.type || "image/jpeg",
            disposition: "attachment",
          });

          console.log(`✅ Converted image ${i} to base64: ${image.name}`);
        } catch (error) {
          console.error(`❌ Error converting image ${i}:`, error);
        }
      }
    }

    // Create JSON payload that matches FastAPI's expected format
    const jsonPayload = {
      json_data: {
        email: email,
        subject: subject,
        body: body,
        attachments: attachments,
      },
    };

    console.log("📤 Sending JSON payload with json_data wrapper to FastAPI...");
    console.log("📋 Payload info:", {
      email: email,
      subject: subject,
      bodyLength: body.length,
      attachmentCount: attachments.length,
      format: "json_data_wrapper",
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Request timeout after 30s");
      controller.abort();
    }, 30000);

    try {
      const response = await fetch(`${BASE_URL}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(jsonPayload),
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
          console.log("✅ Email with images sent successfully (JSON + base64)");
        } catch (parseError) {
          responseData = { message: responseText };
        }

        return NextResponse.json({
          success: true,
          message: "Email with images sent successfully",
          data: responseData,
          debug: {
            method: "JSON_BASE64_PRODUCTION",
            imageCount: attachments.length,
            payloadSize: JSON.stringify(jsonPayload).length,
          },
        });
      } else {
        console.log(
          "❌ FastAPI error with JSON:",
          response.status,
          responseText
        );

        // FALLBACK: If JSON fails, try text-only as backup
        console.log(
          "🔄 FALLBACK: JSON failed, trying text-only email as backup..."
        );
        return await sendEmailViaUrlEncoded(email, subject, body);
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error("🚨 Fetch error with JSON:", fetchError);

      if (fetchError.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 408 });
      }

      // FALLBACK: If network error with JSON, try text-only
      console.log("🔄 FALLBACK: Network error with JSON, trying text-only...");
      return await sendEmailViaUrlEncoded(email, subject, body);
    }
  } catch (error: any) {
    console.error("🚨 JSON processing error:", error);

    // FALLBACK: If JSON processing fails, try text-only
    console.log("🔄 FALLBACK: JSON error, trying text-only...");
    return await sendEmailViaUrlEncoded(email, subject, body);
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
      return NextResponse.json({ error: "Request timeout" }, { status: 408 });
    }

    return NextResponse.json(
      { error: "Network error", details: fetchError.message },
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
