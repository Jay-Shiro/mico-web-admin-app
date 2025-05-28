import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: { riderId: string } }
) {
  try {
    const { riderId } = params;

    if (!riderId) {
      return NextResponse.json(
        { error: "Rider ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BASE_URL}/riders/${riderId}/online-status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      // Return the original response data rather than an error
      // to allow the UI to handle offline status gracefully
      return NextResponse.json({ online: false }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json({ online: data === "online" }, { status: 200 });
  } catch (error) {
    console.error("Error fetching rider online status:", error);
    // Return false for online status on error
    return NextResponse.json({ online: false }, { status: 200 });
  }
}
