import { NextResponse, NextRequest } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BASE_URL}/admins/${params.id}/delete`, {
      method: "DELETE", // The API expects DELETE
      headers: {
        Accept: "application/json",
      },
    });

    const responseText = await response.text();

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      console.error("Failed to parse delete response:", responseText);
      return NextResponse.json(
        { error: responseText || "Server error" },
        { status: response.status }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to delete admin" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Admin deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete admin" },
      { status: 500 }
    );
  }
}
