import { NextResponse, NextRequest } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/riders`, {
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
    console.error("Error fetching riders: ", error);
    return NextResponse.json(
      { error: "Failed to fetch riders data" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty rider IDs" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/riders/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({ ids }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete riders: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error deleting riders:", error);
    return NextResponse.json(
      { error: "Failed to delete riders" },
      { status: 500 }
    );
  }
}
