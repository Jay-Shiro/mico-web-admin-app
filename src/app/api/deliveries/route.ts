import { NextResponse } from "next/server";
import { DeliveryType } from "@/app/(dashboard)/list/tracking/deliveryType";
import { User } from "@/types/userType";
import { Rider } from "@/app/(dashboard)/list/riders/riderType";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function GET() {
  try {
    // Fetch all required data in parallel
    const [deliveriesRes, usersRes, ridersRes] = await Promise.all([
      fetch(`${BASE_URL}/deliveries`, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      }),
      fetch(`${BASE_URL}/users`, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      }),
      fetch(`${BASE_URL}/riders`, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      }),
    ]);

    if (!deliveriesRes.ok || !usersRes.ok || !ridersRes.ok) {
      throw new Error("Failed to fetch required data");
    }

    // Parse responses
    const { deliveries }: { deliveries: DeliveryType[] } =
      await deliveriesRes.json();
    const { users }: { users: User[] } = await usersRes.json();
    const { riders }: { riders: Rider[] } = await ridersRes.json();

    // Create lookup maps for quick access
    const usersMap = new Map(users.map((user) => [user._id, user]));
    const ridersMap = new Map(riders.map((rider) => [rider._id, rider]));

    // Transform deliveries with full user and rider data
    const transformedDeliveries = deliveries.map((delivery) => {
      // Get rider ID from either rider_id or status.riderid
      const riderId = delivery.rider_id || delivery.status?.riderid;
      const rider = riderId ? ridersMap.get(riderId) : null;

      if (riderId && !rider) {
        console.log("Missing rider for ID:", riderId);
      }

      return {
        ...delivery,
        user: usersMap.get(delivery.user_id),
        rider: rider || null,
        status: {
          ...delivery.status,
          deliverystatus:
            delivery.status?.deliverystatus?.toLowerCase() || "pending",
        },
      };
    });

    // Handle case where no deliveries are found
    if (!transformedDeliveries || transformedDeliveries.length === 0) {
      return NextResponse.json(
        {
          status: "success",
          message: "No deliveries found",
          deliveries: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { status: "success", deliveries: transformedDeliveries },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching deliveries: ", error);
    return NextResponse.json(
      {
        error: "Failed to fetch deliveries data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
