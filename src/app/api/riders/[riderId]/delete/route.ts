import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function DELETE(
  req: NextRequest,
  context: { params: { riderId?: string } }
) {
  try {
    const { riderId } = context.params || {}; // Ensure params exist

    if (!riderId) {
      return NextResponse.json(
        { error: "Rider ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/riders/${riderId}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to delete rider ${riderId}`,
          details: response.statusText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error deleting rider:", error);
    return NextResponse.json(
      { error: "Server error while deleting rider" },
      { status: 500 }
    );
  }
}
