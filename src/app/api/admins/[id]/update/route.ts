import { NextResponse, NextRequest } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bodyText = await req.text();
    const formData = new URLSearchParams(bodyText);

    if (Array.from(formData.entries()).length === 0) {
      return NextResponse.json(
        { error: "No update parameters provided" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/admins/${params.id}/update`, {
      method: "PUT",
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error("Invalid response from server");
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to update admin" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update admin" },
      { status: 500 }
    );
  }
}
