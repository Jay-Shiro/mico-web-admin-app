import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function DELETE(
  req: NextRequest,
  { params }: { params: { deliveryId: string } }
) {
  try {
    const { deliveryId } = params;

    if (!deliveryId) {
      return NextResponse.json(
        { error: "Delivery ID is required" },
        { status: 400 }
      );
    }

    // Call the external API to delete the delivery
    const response = await fetch(`${BASE_URL}/deliveries/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        execute_code: deliveryId,
      }),
    });

    if (!response.ok) {
      // Try to get detailed error information
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || response.statusText;
      } catch {
        errorMessage = `Failed to delete delivery (${response.status})`;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json(
      { status: "success", message: "Delivery deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting delivery:", error);
    return NextResponse.json(
      {
        error: "Failed to delete delivery",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
