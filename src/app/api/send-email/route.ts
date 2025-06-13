import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Send-email API called at:', new Date().toISOString());
    
    // Parse form data from the request
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;
    
    console.log('📋 Form data parsed:', { 
      email: email ? '✓' : '✗', 
      subject: subject ? '✓' : '✗', 
      body: body ? body.length + ' chars' : '✗' 
    });
    
    // Handle multiple images - get all image files
    const images = formData.getAll("image") as File[];
    const hasImages = images.length > 0 && images.some(img => img instanceof File && img.size > 0);
    
    console.log('🖼️ Images found:', images.length, hasImages ? 'Valid images detected' : 'No valid images');
    if (hasImages) {
      images.forEach((img, i) => {
        console.log(`  Image ${i}:`, { 
          name: img.name, 
          size: img.size, 
          type: img.type,
          isFile: img instanceof File 
        });
      });
    }

    // Validate required fields
    if (!email || !subject || !body) {
      console.log('❌ Validation failed:', { email: !!email, subject: !!subject, body: !!body });
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
      console.log('🔄 Body processed for images, blob URLs replaced');
    }

    // Create native FormData for the FastAPI request with proper headers
    const fastApiFormData = new FormData();
    fastApiFormData.append("email", email);
    fastApiFormData.append("subject", subject);
    fastApiFormData.append("body", processedBody);

    // Add all images if they exist
    if (hasImages) {
      images.forEach((image, index) => {
        if (image instanceof File && image.size > 0) {
          // Use consistent naming that FastAPI expects
          fastApiFormData.append("image", image, image.name || `image_${index}.jpg`);
          console.log(`📎 Added image ${index}:`, image.name, `(${image.size} bytes)`);
        }
      });
    }

    console.log('🚀 Sending to FastAPI:', BASE_URL + '/send-email');

    // Send to FastAPI with proper headers and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Request timeout after 30s');
      controller.abort();
    }, 30000); // 30 second timeout

    const response = await fetch(`${BASE_URL}/send-email`, {
      method: "POST",
      body: fastApiFormData,
      signal: controller.signal,
      // Remove Content-Type header to let browser set it with boundary for multipart/form-data
      headers: {
        // Let the browser set Content-Type automatically for FormData
      },
    });

    clearTimeout(timeoutId);
    
    console.log('📡 FastAPI response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const responseText = await response.text();
    console.log('📄 FastAPI response text:', responseText.substring(0, 500), responseText.length > 500 ? '...(truncated)' : '');

    if (response.ok) {
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('✅ Email sent successfully');
      } catch {
        responseData = { message: responseText };
        console.log('📝 Non-JSON response, treating as message');
      }

      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        data: responseData,
      });
    } else {
      console.log('❌ FastAPI error:', response.status, responseText);
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
    console.error('🚨 Send-email API error:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
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
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
