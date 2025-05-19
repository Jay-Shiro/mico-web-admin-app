import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/riders/online`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Ensure we have the correct format for riders array
    const riders = Array.isArray(data.riders)
      ? data.riders
      : Array.isArray(data)
      ? data
      : [];

    // Return both the count and the array of online riders
    return NextResponse.json(
      {
        status: "success",
        count: riders.length,
        riders: riders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching online riders: ", error);
    return NextResponse.json(
      { error: "Failed to fetch online riders data", count: 0, riders: [] },
      { status: 500 }
    );
  }
}
