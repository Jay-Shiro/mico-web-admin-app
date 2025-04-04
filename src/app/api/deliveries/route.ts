import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_API_BASE_URL}/deliveries`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status} \n Error message: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Handle case where no deliveries are found
    if (!data.deliveries || data.deliveries.length === 0) {
      return NextResponse.json(
        { status: "success", message: "No deliveries found", deliveries: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching deliveries: ", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries data" },
      { status: 500 }
    );
  }
}