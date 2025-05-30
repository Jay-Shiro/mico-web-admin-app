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
      cache: "no-store" as RequestCache,
    };

    // Fetch data with improved error handling
    let deliveriesData = { deliveries: [] };
    let usersData = { users: [] };
    let ridersData = { riders: [] };

    try {
      // Only fetch deliveries first as they're most essential
      const deliveriesResponse = await fetch(
        `${BASE_URL}/deliveries`,
        fetchOptions
      );
      if (!deliveriesResponse.ok) {
        throw new Error(
          `API request failed: ${deliveriesResponse.status} ${deliveriesResponse.statusText}`
        );
      }
      deliveriesData = await deliveriesResponse.json();

      // If we have no deliveries, there's no need to fetch users or riders
      if (deliveriesData.deliveries && deliveriesData.deliveries.length > 0) {
        // Get unique user and rider IDs from deliveries to minimize required data
        const userIds = new Set();
        const riderIds = new Set();

        deliveriesData.deliveries.forEach((delivery: DeliveryType) => {
          if (delivery.user_id) userIds.add(delivery.user_id);
          if (delivery.rider_id) riderIds.add(delivery.rider_id);
        });

        // Only if we have user/rider IDs, fetch their data
        if (userIds.size > 0 || riderIds.size > 0) {
          const [usersResponse, ridersResponse] = await Promise.all([
            fetch(`${BASE_URL}/users`, fetchOptions),
            fetch(`${BASE_URL}/riders`, fetchOptions),
          ]);

          if (usersResponse.ok) {
            usersData = await usersResponse.json();
          }

          if (ridersResponse.ok) {
            ridersData = await ridersResponse.json();
          }
        }
      }
    } catch (error) {
      console.warn("Error fetching some data, using partial data:", error);
      // Continue with whatever data we have
    }

    // Safely extract arrays with fallbacks
    const deliveries = deliveriesData?.deliveries || [];
    const users = usersData?.users || [];
    const riders = ridersData?.riders || [];

    // Create lookup maps for quick access
    const usersMap = new Map(users.map((user: User) => [user._id, user]));
    const ridersMap = new Map(riders.map((rider: Rider) => [rider._id, rider]));

    // Transform deliveries with full user and rider data
    const transformedDeliveries = deliveries.map((delivery: DeliveryType) => {
      return {
        ...delivery,
        user: delivery.user_id ? usersMap.get(delivery.user_id) || null : null,
        rider: delivery.rider_id
          ? ridersMap.get(delivery.rider_id) || null
          : null,
        status: {
          ...delivery.status,
          current: delivery.status?.current?.toLowerCase() || "pending",
        },
      };
    });

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
