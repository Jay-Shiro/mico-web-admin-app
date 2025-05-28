import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

// GET A SINGLE RIDER BY ID
export async function GET(
  req: NextRequest,
  { params }: { params: { riderId: string } }
) {
  try {
    const response = await fetch(`${BASE_URL}/riders/${params.riderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to Fetch Rider:  ${response.status} \n Error message: ${response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching rider: ", error);
    return NextResponse.json(
      { error: `Failed to fetch rider ${params.riderId}'s data` },
      { status: 500 }
    );
  }
}
