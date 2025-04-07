import { NextResponse, NextRequest } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/admins`, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch(`${BASE_URL}/admin/signup`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
