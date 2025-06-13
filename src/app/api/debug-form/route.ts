import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Debug endpoint called");

    const formData = await request.formData();

    console.log("📋 Received FormData entries:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `  ${key}: File(name: ${value.name}, size: ${value.size}, type: ${value.type})`
        );

        // Log first few bytes of the file
        const arrayBuffer = await value.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const firstBytes = Array.from(uint8Array.slice(0, 10))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" ");
        console.log(`    First 10 bytes: ${firstBytes}`);
      } else {
        console.log(`  ${key}: ${typeof value} - ${value}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Debug endpoint received data successfully",
      entries: Array.from(formData.keys()),
    });
  } catch (error: any) {
    console.error("🚨 Debug endpoint error:", error);
    return NextResponse.json(
      {
        error: "Debug endpoint error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
