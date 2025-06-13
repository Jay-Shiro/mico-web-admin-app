import { NextRequest, NextResponse } from "next/server";
import { FormData as NodeFormData, File as NodeFile } from "formdata-node";

const BASE_URL = process.env.NEXT_API_BASE_URL;

/**
 * Email sending API route with Vercel-optimized multipart form handling
 *
 * Key improvements for production deployment:
 * - Uses formdata-node instead of native FormData for better Vercel compatibility
 * - Proper multipart boundary generation that FastAPI can parse correctly
 * - Multiple retry strategies for robust email delivery
 */

export async function POST(request: NextRequest) {
  try {
    console.log("📧 Send-email API called at:", new Date().toISOString());

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

    // Handle multiple images - get all image files
    const images = formData.getAll("image") as File[];
    const hasImages =
      images.length > 0 &&
      images.some((img) => img instanceof File && img.size > 0);

    console.log(
      "🖼️ Images found:",
      images.length,
      hasImages ? "Valid images detected" : "No valid images"
    );
    if (hasImages) {
      images.forEach((img, i) => {
        console.log(`  Image ${i}:`, {
          name: img.name,
          size: img.size,
          type: img.type,
          isFile: img instanceof File,
        });
      });
    }

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

    // Process body - replace blob URLs with cid references if images exist
    let processedBody = body;
    if (hasImages) {
      // Replace any blob URLs with cid references
      processedBody = processedBody.replace(
        /blob:[^"'\s)]+/g,
        "cid:inline_image"
      );
      console.log("🔄 Body processed for images, blob URLs replaced");
    }

    // Create FormData using formdata-node for better Vercel compatibility with FastAPI
    console.log(
      "📤 Using formdata-node for better multipart compatibility on Vercel..."
    );
    const fastApiFormData = new NodeFormData();
    fastApiFormData.append("email", email);
    fastApiFormData.append("subject", subject);
    fastApiFormData.append("body", processedBody);

    // Add all images if they exist with proper content type handling using NodeFile
    if (hasImages) {
      for (let index = 0; index < images.length; index++) {
        const image = images[index];
        if (image instanceof File && image.size > 0) {
          try {
            // Ensure proper file naming and content type
            const fileName = image.name || `image_${index}.jpg`;
            const fileType = image.type || "image/jpeg";

            // Convert file to ArrayBuffer for NodeFile compatibility
            const arrayBuffer = await image.arrayBuffer();

            // Create NodeFile for better compatibility with FastAPI
            const nodeFile = new NodeFile([arrayBuffer], fileName, {
              type: fileType,
              lastModified: Date.now(),
            });

            fastApiFormData.append("image", nodeFile);
            console.log(
              `📎 Added image ${index}:`,
              fileName,
              `(${image.size} bytes, ${fileType})`
            );
          } catch (fileError) {
            console.error(`❌ Error processing image ${index}:`, fileError);
            // Continue with other images
          }
        }
      }
    }

    console.log("🚀 Sending to FastAPI:", BASE_URL + "/send-email");

    // Log FormData entries for debugging
    console.log("📦 FormData contents:");
    for (const [key, value] of fastApiFormData.entries()) {
      if (value instanceof File) {
        console.log(
          `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
        );
      } else {
        console.log(
          `  ${key}: ${
            typeof value === "string"
              ? value.substring(0, 100) + (value.length > 100 ? "..." : "")
              : value
          }`
        );
      }
    }

    // Send to FastAPI with specific headers for better compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Request timeout after 30s");
      controller.abort();
    }, 30000); // 30 second timeout

    const response = await fetch(`${BASE_URL}/send-email`, {
      method: "POST",
      body: fastApiFormData as any, // formdata-node FormData
      signal: controller.signal,
      // Let formdata-node handle the Content-Type with proper boundary
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    console.log("📡 FastAPI response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    const responseText = await response.text();
    console.log(
      "📄 FastAPI response text:",
      responseText.substring(0, 500),
      responseText.length > 500 ? "...(truncated)" : ""
    );

    // If we get a parsing error with images, try without recreating File objects
    if (
      !response.ok &&
      responseText.includes("parsing the body") &&
      hasImages
    ) {
      console.log("🔄 Retrying without File object recreation...");

      // Create a new FormData with original files using NodeFormData
      const retryFormData = new NodeFormData();
      retryFormData.append("email", email);
      retryFormData.append("subject", subject);
      retryFormData.append("body", processedBody);

      // Add original images without modification using NodeFile
      for (let index = 0; index < images.length; index++) {
        const image = images[index];
        if (image instanceof File && image.size > 0) {
          try {
            const arrayBuffer = await image.arrayBuffer();
            const nodeFile = new NodeFile([arrayBuffer], image.name, {
              type: image.type || "image/jpeg",
            });
            retryFormData.append("image", nodeFile);
            console.log(
              `📎 Retry - Added original image ${index}:`,
              image.name
            );
          } catch (retryError) {
            console.error(
              `❌ Error processing retry image ${index}:`,
              retryError
            );
          }
        }
      }

      const retryController = new AbortController();
      const retryTimeoutId = setTimeout(() => {
        retryController.abort();
      }, 30000);

      const retryResponse = await fetch(`${BASE_URL}/send-email`, {
        method: "POST",
        body: retryFormData as any, // formdata-node FormData
        signal: retryController.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(retryTimeoutId);

      console.log("📡 FastAPI retry response:", {
        status: retryResponse.status,
        statusText: retryResponse.statusText,
      });

      const retryResponseText = await retryResponse.text();

      if (retryResponse.ok) {
        let responseData;
        try {
          responseData = JSON.parse(retryResponseText);
          console.log("✅ Email sent successfully on retry");
        } catch {
          responseData = { message: retryResponseText };
        }

        return NextResponse.json({
          success: true,
          message: "Email sent successfully (retry)",
          data: responseData,
        });
      } else {
        // Final fallback: try sending without images
        console.log("🔄 Final fallback: attempting to send without images...");

        const noImageFormData = new NodeFormData();
        noImageFormData.append("email", email);
        noImageFormData.append("subject", subject);
        noImageFormData.append("body", body); // Use original body without blob URL processing

        const noImageController = new AbortController();
        const noImageTimeoutId = setTimeout(() => {
          noImageController.abort();
        }, 30000);

        const noImageResponse = await fetch(`${BASE_URL}/send-email`, {
          method: "POST",
          body: noImageFormData as any, // formdata-node FormData
          signal: noImageController.signal,
          headers: {
            Accept: "application/json",
          },
        });

        clearTimeout(noImageTimeoutId);
        const noImageResponseText = await noImageResponse.text();

        if (noImageResponse.ok) {
          let responseData;
          try {
            responseData = JSON.parse(noImageResponseText);
            console.log("✅ Email sent successfully without images");
          } catch {
            responseData = { message: noImageResponseText };
          }

          return NextResponse.json({
            success: true,
            message:
              "Email sent successfully (without images due to processing error)",
            data: responseData,
            warning: "Images could not be processed and were omitted",
          });
        }

        return NextResponse.json(
          {
            error: "Failed to send email via FastAPI (all attempts failed)",
            details: noImageResponseText,
            status: noImageResponse.status,
          },
          { status: noImageResponse.status }
        );
      }
    }

    if (response.ok) {
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("✅ Email sent successfully");
      } catch {
        responseData = { message: responseText };
        console.log("📝 Non-JSON response, treating as message");
      }

      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        data: responseData,
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
  } catch (error: any) {
    console.error("🚨 Send-email API error:", error);

    // Handle specific error types
    if (error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Request timeout",
          details: "The email sending request timed out after 30 seconds",
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
