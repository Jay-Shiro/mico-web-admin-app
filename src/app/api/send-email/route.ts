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
    const hasImages = images.length > 0 && images.some((img) => img instanceof File && img.size > 0);

    // Validate required fields
    if (!email || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields: email, subject, or body" },
        { status: 400 }
      );
    }

    // PRODUCTION: Use simpler native FormData approach for FastAPI compatibility
    if (process.env.NODE_ENV === "production") {
      const debugInfo: any = { branch: "production-native-formdata" };
      console.log("🚀 PRODUCTION MODE: Using native FormData for FastAPI compatibility");
      
      // Use native FormData (same as curl -F)
      const productionFormData = new FormData();
      productionFormData.append("email", email);
      productionFormData.append("subject", subject);
      productionFormData.append("body", body);
      
      if (hasImages) {
        console.log("📎 Adding images in production...");
        for (let index = 0; index < images.length; index++) {
          const image = images[index];
          if (image instanceof File && image.size > 0) {
            productionFormData.append("image", image, image.name || `image_${index}.jpg`);
            console.log(`📎 Added image ${index}: ${image.name} (${image.size} bytes)`);
          }
        }
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      try {
        const response = await fetch(`${BASE_URL}/send-email`, {
          method: "POST",
          body: productionFormData,
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            // Let browser set Content-Type with boundary
          },
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
            message: "Email sent successfully",
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
            debug: { ...debugInfo, fetchErrorName: fetchError.name, fetchErrorType: typeof fetchError },
          },
          { status: 500 }
        );
      }
    }
    // DEVELOPMENT MODE: Use FormData with images as before
    return await sendEmailViaDevelopmentFormData(email, subject, body, images, { branch: "development-native-formdata" });
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
    }, 30000);        const response = await fetch(`${BASE_URL}/send-email`, {
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
      { error: "Development email sending failed", details: error.message, debug: debugInfo },
      { status: 500 }
    );
  }
}
