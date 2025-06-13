import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

/**
 * Production-optimized email API route with fallback strategies
 * 
 * This implementation uses multiple approaches to ensure compatibility:
 * 1. Native FormData for simple cases
 * 2. JSON-based approach for complex data
 * 3. Automatic fallback mechanisms
 */

export async function POST(request: NextRequest) {
  try {
    console.log("📧 Send-email API called at:", new Date().toISOString());
    console.log("🌍 Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      BASE_URL: BASE_URL,
      isProduction: process.env.NODE_ENV === 'production'
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

    // Handle multiple images
    const images = formData.getAll("image") as File[];
    const hasImages = images.length > 0 && images.some((img) => img instanceof File && img.size > 0);

    console.log("🖼️ Images found:", images.length, hasImages ? "Valid images detected" : "No valid images");

    // Validate required fields
    if (!email || !subject || !body) {
      console.log("❌ Validation failed:", { email: !!email, subject: !!subject, body: !!body });
      return NextResponse.json(
        { error: "Missing required fields: email, subject, or body" },
        { status: 400 }
      );
    }

    // Production strategy: Try JSON first for better compatibility
    if (process.env.NODE_ENV === 'production') {
      console.log("🚀 Using production-optimized JSON approach...");
      return await sendEmailViaJSON(email, subject, body, images);
    }

    // Development: Use FormData as before
    console.log("🛠️ Using development FormData approach...");
    return await sendEmailViaFormData(email, subject, body, images);

  } catch (error: any) {
    console.error("🚨 Send-email API error:", error);
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

/**
 * Production-optimized JSON-based email sending
 * Converts images to base64 and sends as JSON payload
 */
async function sendEmailViaJSON(email: string, subject: string, body: string, images: File[]) {
  try {
    console.log("📤 Converting images to base64 for JSON payload...");
    
    const imageData = [];
    
    // Convert images to base64 if they exist
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (image instanceof File && image.size > 0) {
          try {
            // Limit image size for JSON payload (max 1MB each)
            if (image.size > 1024 * 1024) {
              console.warn(`⚠️ Image ${i} too large (${image.size} bytes), skipping...`);
              continue;
            }

            const arrayBuffer = await image.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            
            imageData.push({
              filename: image.name || `image_${i}.jpg`,
              content_type: image.type || "image/jpeg",
              data: base64
            });
            
            console.log(`📎 Converted image ${i} to base64: ${image.name} (${image.size} bytes)`);
          } catch (imageError) {
            console.error(`❌ Error converting image ${i}:`, imageError);
          }
        }
      }
    }

    // Create JSON payload
    const payload = {
      email: email,
      subject: subject,
      body: body,
      images: imageData
    };

    console.log(`🚀 Sending JSON payload to FastAPI (${imageData.length} images)`);

    // Send JSON request to FastAPI
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ JSON request timeout after 30s");
      controller.abort();
    }, 30000);

    try {
      const response = await fetch(`${BASE_URL}/send-email-json`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("📡 FastAPI JSON response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const responseText = await response.text();
      console.log("📄 FastAPI JSON response text:", responseText.substring(0, 500));

      if (response.ok) {
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log("✅ Email sent successfully via JSON");
        } catch (parseError) {
          responseData = { message: responseText };
        }

        return NextResponse.json({
          success: true,
          message: "Email sent successfully",
          data: responseData,
        });
      } else {
        // If JSON endpoint fails, try FormData fallback
        console.log("🔄 JSON approach failed, trying FormData fallback...");
        return await sendEmailViaFormData(email, subject, body, images);
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === "AbortError") {
        console.log("⏰ JSON request timed out, trying FormData fallback...");
        return await sendEmailViaFormData(email, subject, body, images);
      }
      
      // Try FormData as fallback
      console.log("🔄 JSON request failed, trying FormData fallback...");
      return await sendEmailViaFormData(email, subject, body, images);
    }
  } catch (error: any) {
    console.error("🚨 JSON email sending failed:", error);
    // Final fallback to FormData
    return await sendEmailViaFormData(email, subject, body, images);
  }
}

/**
 * Traditional FormData approach (fallback)
 */
async function sendEmailViaFormData(email: string, subject: string, body: string, images: File[]) {
  try {
    console.log("📤 Creating native FormData...");
    
    // Use native FormData (not formdata-node)
    const fastApiFormData = new FormData();
    
    fastApiFormData.append("email", email);
    fastApiFormData.append("subject", subject);
    fastApiFormData.append("body", body);

    // Add images if they exist
    const hasImages = images.length > 0 && images.some((img) => img instanceof File && img.size > 0);
    
    if (hasImages) {
      console.log("📎 Processing images for FormData attachment...");
      for (let index = 0; index < images.length; index++) {
        const image = images[index];
        if (image instanceof File && image.size > 0) {
          try {
            fastApiFormData.append("image", image, image.name || `image_${index}.jpg`);
            console.log(`📎 Added image ${index}:`, image.name, `(${image.size} bytes)`);
          } catch (fileError) {
            console.error(`❌ Error processing image ${index}:`, fileError);
          }
        }
      }
    }

    console.log("🚀 Sending FormData to FastAPI:", BASE_URL + "/send-email");

    // Send to FastAPI with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ FormData request timeout after 30s");
      controller.abort();
    }, 30000);

    try {
      const response = await fetch(`${BASE_URL}/send-email`, {
        method: "POST",
        body: fastApiFormData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type, let browser handle multipart boundary
        },
      });

      clearTimeout(timeoutId);

      console.log("📡 FastAPI FormData response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const responseText = await response.text();
      console.log("📄 FastAPI FormData response text:", responseText.substring(0, 500));

      if (response.ok) {
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log("✅ Email sent successfully via FormData");
        } catch (parseError) {
          responseData = { message: responseText };
        }

        return NextResponse.json({
          success: true,
          message: "Email sent successfully",
          data: responseData,
        });
      } else {
        console.log("❌ FastAPI FormData error:", response.status, responseText);
        
        // If we have images and get a parsing error, try without images
        if (hasImages && (responseText.includes("parsing") || responseText.includes("multipart") || response.status === 422)) {
          console.log("🔄 Retrying without images due to parsing error...");
          return await sendWithoutImages(email, subject, body);
        }
        
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
      
      if (fetchError.name === "AbortError") {
        console.log("⏰ FormData request timed out");
        return NextResponse.json(
          { error: "Request timeout", details: "The email sending request timed out after 30 seconds" },
          { status: 408 }
        );
      }
      
      throw fetchError;
    }
  } catch (error: any) {
    console.error("🚨 FormData email sending failed:", error);
    
    // Final fallback: try without images
    return await sendWithoutImages(email, subject, body);
  }
}

/**
 * Fallback function to send email without images
 */
async function sendWithoutImages(email: string, subject: string, body: string) {
  try {
    console.log("📤 Sending fallback email without images...");
    
    const fallbackFormData = new FormData();
    fallbackFormData.append("email", email);
    fallbackFormData.append("subject", subject);
    fallbackFormData.append("body", body);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000);

    const response = await fetch(`${BASE_URL}/send-email`, {
      method: "POST",
      body: fallbackFormData,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    const responseText = await response.text();

    if (response.ok) {
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("✅ Fallback email sent successfully (without images)");
      } catch {
        responseData = { message: responseText };
      }

      return NextResponse.json({
        success: true,
        message: "Email sent successfully (images were omitted due to processing error)",
        data: responseData,
        warning: "Images could not be processed and were omitted",
      });
    } else {
      console.log("❌ Fallback also failed:", response.status, responseText);
      return NextResponse.json(
        {
          error: "Failed to send email (both with and without images)",
          details: responseText,
          status: response.status,
        },
        { status: response.status }
      );
    }
  } catch (fallbackError: any) {
    console.error("🚨 Fallback email sending failed:", fallbackError);
    
    if (fallbackError.name === "AbortError") {
      return NextResponse.json(
        { error: "Fallback request timeout", details: "The fallback email sending request timed out" },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: "Fallback email sending failed", details: fallbackError.message },
      { status: 500 }
    );
  }
}
