import { NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_API_BASE_URL || "https://deliveryapi-ten.vercel.app";

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/deliveries`, {
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
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching deliveries: ", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries data" },
      { status: 500 }
    );
  }
}
