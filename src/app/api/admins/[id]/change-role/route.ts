import { NextResponse, NextRequest } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { role } = await req.json();
    const adminId = params.id;

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    console.log("Sending to API:", {
      url: `${BASE_URL}/admins/${adminId}/change-role`,
      role: role,
    });

    const response = await fetch(`${BASE_URL}/admins/${adminId}/change-role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ role }).toString(),
    });

    const data = await response.json();
    console.log("Backend response:", data);

    if (!response.ok) {
      throw new Error(
        data.detail?.[0]?.msg || data.error || "Failed to update role"
      );
    }

    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    console.error("Role change error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update role" },
      { status: 500 }
    );
  }
}
