import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function PUT(
  req: NextRequest,
  { params }: { params: { riderId: string; action: string } }
) {
  try {
    const { riderId, action } = params;

    if (!riderId || !["activate", "deactivate"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/riders/${riderId}/${action}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to ${action} rider: ${error}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ status: "success", action });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update rider status" },
      { status: 500 }
    );
  }
}
