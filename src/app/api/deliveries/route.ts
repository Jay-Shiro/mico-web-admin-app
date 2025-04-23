import { NextResponse } from "next/server";
import { DeliveryType } from "@/app/(dashboard)/list/tracking/deliveryType";
import { User } from "@/types/userType";
import { Rider } from "@/app/(dashboard)/list/riders/riderType";
import { fetchWithCache } from "@/utils/fetchWithCache";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function GET() {
  try {
    // Cache TTLs
    const DELIVERIES_TTL = 60 * 1000; // 1 minute
    const USERS_TTL = 5 * 60 * 1000; // 5 minutes
    const RIDERS_TTL = 5 * 60 * 1000; // 5 minutes

    // Common fetch options
    const fetchOptions = {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    };

    // Fetch all required data in parallel with caching
    let deliveriesData;
    let usersData;
    let ridersData;

    try {
      [deliveriesData, usersData, ridersData] = await Promise.all([
        fetchWithCache(`${BASE_URL}/deliveries`, {
          ...fetchOptions,
          cacheTTL: DELIVERIES_TTL,
        }),
        fetchWithCache(`${BASE_URL}/users`, {
          ...fetchOptions,
          cacheTTL: USERS_TTL,
        }),
        fetchWithCache(`${BASE_URL}/riders`, {
          ...fetchOptions,
          cacheTTL: RIDERS_TTL,
        }),
      ]);
    } catch (error) {
      // Handle 404 for deliveries specially
      if (
        error instanceof Error &&
        error.message.includes("API request failed: 404")
      ) {
        deliveriesData = { deliveries: [] };

        // Still need users and riders data
        [usersData, ridersData] = await Promise.all([
          fetchWithCache(`${BASE_URL}/users`, {
            ...fetchOptions,
            cacheTTL: USERS_TTL,
          }),
          fetchWithCache(`${BASE_URL}/riders`, {
            ...fetchOptions,
            cacheTTL: RIDERS_TTL,
          }),
        ]);
      } else {
        throw error;
      }
    }

    const { deliveries = [] } = deliveriesData;
    const { users } = usersData;
    const { riders } = ridersData;

    // Create lookup maps for quick access
    const usersMap = new Map(users.map((user: User) => [user._id, user]));
    const ridersMap = new Map(riders.map((rider: Rider) => [rider._id, rider]));

    // Transform deliveries with full user and rider data
    const transformedDeliveries = deliveries.map((delivery: DeliveryType) => {
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
          current: delivery.status?.current?.toLowerCase() || "pending",
        },
      };
    });

    // Return empty list if no deliveries
    if (transformedDeliveries.length === 0) {
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
