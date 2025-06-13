import { NextRequest, NextResponse } from "next/server";
import { FormData } from "formdata-node";

const BASE_URL = process.env.NEXT_API_BASE_URL;

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

    // Create FormData for FastAPI
    console.log("📤 Creating FormData for FastAPI...");
    const fastApiFormData = new FormData();
    
    fastApiFormData.append("email", email);
    fastApiFormData.append("subject", subject);
    fastApiFormData.append("body", body);

    // Add images if they exist
    if (hasImages) {
      console.log("📎 Processing images for attachment...");
      for (let index = 0; index < images.length; index++) {
        const image = images[index];
        if (image instanceof File && image.size > 0) {
          try {
            const fileName = image.name || `image_${index}.jpg`;
            const fileType = image.type || "image/jpeg";
            const arrayBuffer = await image.arrayBuffer();
            
            fastApiFormData.append("image", new Blob([arrayBuffer], { type: fileType }), fileName);
            console.log(`📎 Added image ${index}:`, fileName, `(${image.size} bytes, ${fileType})`);
          } catch (fileError) {
            console.error(`❌ Error processing image ${index}:`, fileError);
          }
        }
      }
    }

    console.log("🚀 Sending to FastAPI:", BASE_URL + "/send-email");

    // Send to FastAPI with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Request timeout after 30s");
      controller.abort();
    }, 30000);

    try {
      const response = await fetch(`${BASE_URL}/send-email`, {
        method: "POST",
        body: fastApiFormData as any,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      console.log("📡 FastAPI response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const responseText = await response.text();
      console.log("📄 FastAPI response text:", responseText.substring(0, 500));

      if (response.ok) {
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log("✅ Email sent successfully");
        } catch (parseError) {
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
        console.log("⏰ Request timed out");
        return NextResponse.json(
          { error: "Request timeout", details: "The email sending request timed out after 30 seconds" },
          { status: 408 }
        );
      }
      
      throw fetchError;
    }

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
      body: fallbackFormData as any,
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
