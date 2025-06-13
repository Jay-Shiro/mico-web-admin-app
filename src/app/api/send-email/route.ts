import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

/**
 * PRODUCTION-STABLE EMAIL API ROUTE
 *
 * This version uses the proven URL-encoded approach for production reliability:
 * - Uses simple URL-encoded parameters instead of FormData for production
 * - Disables images in production temporarily to ensure basic email functionality works
 * - Includes comprehensive logging for debugging
 * - Will support images once basic functionality is confirmed stable
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

    // PRODUCTION STRATEGY: Use proven URL-encoded approach for reliability
    if (process.env.NODE_ENV === "production") {
      console.log(
        "🚀 PRODUCTION MODE: Using URL-encoded approach for maximum reliability"
      );

      if (hasImages) {
        console.log(
          "⚠️ Images detected but disabled in production for stability"
        );
      }

      // Use URL-encoded form data instead of multipart for production reliability
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
          headers: Object.fromEntries(response.headers.entries()),
        });

        const responseText = await response.text();
        console.log("📄 FastAPI response text:", responseText);

        if (response.ok) {
          let responseData;
          try {
            responseData = JSON.parse(responseText);
            console.log("✅ Email sent successfully (production mode)");
          } catch (parseError) {
            responseData = { message: responseText };
            console.log("📝 Non-JSON response, treating as message");
          }

          const finalResponse: any = {
            success: true,
            message: hasImages
              ? "Email sent successfully (images temporarily disabled in production)"
              : "Email sent successfully",
            data: responseData,
            debug: {
              method: "URL_ENCODED_STABLE",
              contentType: "application/x-www-form-urlencoded",
              hasImages,
              imageCount: images.length,
            },
          };

          if (hasImages) {
            finalResponse.warning =
              "Images were temporarily disabled in production for stability";
          }

          return NextResponse.json(finalResponse);
        } else {
          console.log("❌ FastAPI error:", response.status, responseText);
          return NextResponse.json(
            {
              error: "Failed to send email via FastAPI",
              details: responseText,
              status: response.status,
              debug: {
                method: "URL_ENCODED_STABLE",
                contentType: "application/x-www-form-urlencoded",
                bodyLength: urlEncodedData.toString().length,
                hasImages,
                imageCount: images.length,
              },
            },
            { status: response.status }
          );
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        console.error("🚨 Fetch error:", fetchError);

        if (fetchError.name === "AbortError") {
          return NextResponse.json(
            {
              error: "Request timeout",
              details: "The email sending request timed out",
            },
            { status: 408 }
          );
        }

        return NextResponse.json(
          {
            error: "Network error",
            details: fetchError.message,
            debug: {
              fetchErrorName: fetchError.name,
              fetchErrorType: typeof fetchError,
              hasImages,
              imageCount: images.length,
            },
          },
          { status: 500 }
        );
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
