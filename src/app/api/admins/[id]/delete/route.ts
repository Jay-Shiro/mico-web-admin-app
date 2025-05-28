import { NextResponse, NextRequest } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bodyText = await req.text();
    const formData = new URLSearchParams(bodyText);

    // Validate input
    if (Array.from(formData.entries()).length === 0) {
      return NextResponse.json(
        { error: "No update parameters provided" },
        { status: 400 }
      );
    }

    // Clean and validate params - remove empty values
    const queryParams = new URLSearchParams();
    for (const [key, value] of Array.from(formData.entries())) {
      if (value && value.trim()) {
        // Don't send empty password
        if (key === "password" && !value.trim()) continue;
        queryParams.append(key, value.trim());
      }
    }

    const apiUrl = `${BASE_URL}/admins/${params.id}/update?${queryParams}`;

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: responseText || "Failed to update admin" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Admin updated successfully",
    });
  } catch (error: any) {
    console.error("Error in update route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
