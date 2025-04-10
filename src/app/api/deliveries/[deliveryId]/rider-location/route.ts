import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function GET(
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

    const response = await fetch(
      `${BASE_URL}/deliveries/${deliveryId}/rider-location`,
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    // Handle specific error case for non-in-progress deliveries
    if (
      data.detail?.includes(
        "Location can only be retrieved for ongoing or in-progress deliveries"
      )
    ) {
      return NextResponse.json(
        {
          error: "Delivery not in progress",
          details: "Location tracking is only available for ongoing deliveries",
          status: 404,
        },
        { status: 404 }
      );
    }

    if (!response.ok) {
      console.error(`Error response for ${deliveryId}:`, {
        status: response.status,
        data: data,
      });

      return NextResponse.json(
        {
          error:
            data.message ||
            `Failed to fetch location for delivery ${deliveryId}`,
          details: data,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Validate location data
    if (
      !data.location_data ||
      typeof data.location_data.latitude !== "number" ||
      typeof data.location_data.longitude !== "number"
    ) {
      console.error(`Invalid location data for ${deliveryId}:`, data);

      return NextResponse.json(
        {
          error: "Invalid location data received",
          details: data,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(
      `Critical error fetching location for ${params.deliveryId}:`,
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch rider location",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
