import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    console.log("📧 Send-email API called at:", new Date().toISOString());
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

    // Handle images
    const images = formData.getAll("image") as File[];
    const hasImages =
      images.length > 0 &&
      images.some((img) => img instanceof File && img.size > 0);

    // Validate required fields
    if (!email || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields: email, subject, or body" },
        { status: 400 }
      );
    }

    // PRODUCTION: Hybrid approach - JSON for images, URL-encoded for text-only
    if (process.env.NODE_ENV === "production") {
      const debugInfo: any = {
        branch: hasImages
          ? "production-json-with-images"
          : "production-url-encoded",
        hasImages,
        imageCount: images.length,
      };

      if (hasImages) {
        console.log(
          "🚀 PRODUCTION MODE: Using JSON with base64 images for FastAPI compatibility"
        );

        // Convert images to base64 attachments
        const attachments = [];
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          if (image instanceof File && image.size > 0) {
            try {
              const arrayBuffer = await image.arrayBuffer();
              const base64 = Buffer.from(arrayBuffer).toString("base64");
              attachments.push({
                filename: image.name || `image_${i}.jpg`,
                content: base64,
                type: image.type || "image/jpeg",
                disposition: "attachment",
              });
              console.log(
                `📎 Converted image ${i} to base64: ${image.name} (${image.size} bytes)`
              );
            } catch (error) {
              console.error(`❌ Error converting image ${i}:`, error);
            }
          }
        }

        // Send as JSON with base64 attachments
        const jsonPayload = {
          to: email,
          subject: subject,
          body: body,
          attachments: attachments,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

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
          const responseText = await response.text();

          if (response.ok) {
            let responseData;
            try {
              responseData = JSON.parse(responseText);
            } catch {
              responseData = { message: responseText };
            }
            return NextResponse.json({
              success: true,
              message: "Email with images sent successfully",
              data: responseData,
              debug: debugInfo,
            });
          } else {
            return NextResponse.json(
              {
                error: "Failed to send email with images via FastAPI",
                details: responseText,
                status: response.status,
                debug: debugInfo,
              },
              { status: response.status }
            );
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          return NextResponse.json(
            {
              error: "Network error sending email with images",
              details: fetchError.message,
              debug: { ...debugInfo, fetchErrorName: fetchError.name },
            },
            { status: 500 }
          );
        }
      } else {
        console.log("🚀 PRODUCTION MODE: Using URL-encoded data (no images)");

        // Use the working URL-encoded approach for text-only emails
        const urlEncodedData = new URLSearchParams();
        urlEncodedData.append("email", email);
        urlEncodedData.append("subject", subject);
        urlEncodedData.append("body", body);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

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
          const responseText = await response.text();
          if (response.ok) {
            let responseData;
            try {
              responseData = JSON.parse(responseText);
            } catch {
              responseData = { message: responseText };
            }
            return NextResponse.json({
              success: true,
              message: hasImages
                ? "Email sent successfully (images temporarily disabled in production)"
                : "Email sent successfully",
              data: responseData,
              debug: { ...debugInfo, hasImages, imageCount: images.length },
            });
          } else {
            return NextResponse.json(
              {
                error: "Failed to send email via FastAPI",
                details: responseText,
                status: response.status,
                debug: { ...debugInfo, hasImages, imageCount: images.length },
              },
              { status: response.status }
            );
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          return NextResponse.json(
            {
              error: "Network error",
              details: fetchError.message,
              debug: {
                ...debugInfo,
                fetchErrorName: fetchError.name,
                fetchErrorType: typeof fetchError,
              },
            },
            { status: 500 }
          );
        }
      }
    } else {
      // DEVELOPMENT MODE: Use FormData with images as before
      return await sendEmailViaDevelopmentFormData(
        email,
        subject,
        body,
        images,
        { branch: "development-native-formdata" }
      );
    }
  } catch (error: any) {
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

async function sendEmailViaDevelopmentFormData(
  email: string,
  subject: string,
  body: string,
  images: File[],
  debugInfo: any = {}
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
      // No headers - let the browser handle everything
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
        debug: debugInfo,
      });
    } else {
      return NextResponse.json(
        {
          error: "Failed to send email via FastAPI",
          details: responseText,
          status: response.status,
          debug: debugInfo,
        },
        { status: response.status }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Development email sending failed",
        details: error.message,
        debug: debugInfo,
      },
      { status: 500 }
    );
  }
}
