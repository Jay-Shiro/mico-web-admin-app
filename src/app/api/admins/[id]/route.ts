import { NextResponse, NextRequest } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BASE_URL}/admins/${params.id}/delete`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete admin" },
      { status: 500 }
    );
  }
}
