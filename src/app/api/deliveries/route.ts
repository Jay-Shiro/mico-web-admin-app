import { NextResponse } from "next/server";
import { DeliveryType } from "@/app/(dashboard)/list/tracking/deliveryType";
import { User } from "@/types/userType";
import { Rider } from "@/app/(dashboard)/list/riders/riderType";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function GET() {
  try {
    // Common fetch options
    const fetchOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    };

    // Fetch all required data in parallel
    let deliveriesData;
    let usersData;
    let ridersData;

    try {
      const [deliveriesResponse, usersResponse, ridersResponse] =
        await Promise.all([
          fetch(`${BASE_URL}/deliveries`, fetchOptions),
          fetch(`${BASE_URL}/users`, fetchOptions),
          fetch(`${BASE_URL}/riders`, fetchOptions),
        ]);

      // Check responses and parse JSON
      if (!deliveriesResponse.ok) {
        if (deliveriesResponse.status === 404) {
          deliveriesData = { deliveries: [] };
        } else {
          throw new Error(
            `API request failed: ${deliveriesResponse.status} ${deliveriesResponse.statusText}`
          );
        }
      } else {
        deliveriesData = await deliveriesResponse.json();
      }

      if (usersResponse.ok) {
        usersData = await usersResponse.json();
      } else {
        usersData = { users: [] };
      }

      if (ridersResponse.ok) {
        ridersData = await ridersResponse.json();
      } else {
        ridersData = { riders: [] };
      }
    } catch (error) {
      // Handle 404 for deliveries specially
      if (
        error instanceof Error &&
        error.message.includes("API request failed: 404")
      ) {
        deliveriesData = { deliveries: [] };

        // Still need users and riders data
        const [usersResponse, ridersResponse] = await Promise.all([
          fetch(`${BASE_URL}/users`, fetchOptions),
          fetch(`${BASE_URL}/riders`, fetchOptions),
        ]);

        if (usersResponse.ok) {
          usersData = await usersResponse.json();
        } else {
          usersData = { users: [] };
        }

        if (ridersResponse.ok) {
          ridersData = await ridersResponse.json();
        } else {
          ridersData = { riders: [] };
        }
      } else {
        throw error;
      }
    }

    const { deliveries = [] } = deliveriesData;
    const { users = [] } = usersData;
    const { riders = [] } = ridersData;

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
