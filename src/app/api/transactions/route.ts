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
    const transformedDeliveries = deliveries.map((delivery) => ({
      ...delivery,
      user: usersMap.get(delivery.user_id),
      rider: delivery.status?.riderid
        ? ridersMap.get(delivery.status.riderid)
        : undefined,
      status: {
        ...delivery.status,
        deliverystatus:
          delivery.status?.deliverystatus?.toLowerCase() || "pending",
      },
    }));

    return NextResponse.json(
      {
        status: "success",
        deliveries: transformedDeliveries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions data" },
      { status: 500 }
    );
  }
}
