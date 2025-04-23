import { NextResponse } from "next/server";
import { fetchWithCache } from "@/utils/fetchWithCache";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function GET() {
  try {
    // Cache TTLs - use longer caches to reduce API calls
    const USERS_TTL = 15 * 60 * 1000; // 15 minutes
    const RIDERS_TTL = 15 * 60 * 1000; // 15 minutes

    // Common fetch options
    const fetchOptions = {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    };

    // Fetch users and riders data in parallel using cache
    const [usersData, ridersData] = await Promise.all([
      fetchWithCache(`${BASE_URL}/users`, {
        ...fetchOptions,
        cacheTTL: USERS_TTL,
      }),
      fetchWithCache(`${BASE_URL}/riders`, {
        ...fetchOptions,
        cacheTTL: RIDERS_TTL,
      }),
    ]);

    // Transform users data to include just what we need
    const users = (usersData.users || []).map((user: any) => ({
      id: `u-${user._id}`,
      name:
        `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
        "Unnamed User",
      email: user.email,
      phone: user.phone || "",
      status: user.status || "active",
      dateJoined: user.date_joined || "",
      type: "customer",
    }));

    // Transform riders data to include just what we need
    const riders = (ridersData.riders || []).map((rider: any) => ({
      id: `r-${rider._id}`,
      name:
        `${rider.firstname || ""} ${rider.lastname || ""}`.trim() ||
        "Unnamed Rider",
      email: rider.email,
      phone: rider.phone || "",
      status: rider.status || "active",
      dateJoined: rider.date_joined || "",
      type: "rider",
      vehicle: rider.vehicle_type || "",
    }));

    return NextResponse.json({
      status: "success",
      users,
      riders,
    });
  } catch (error) {
    console.error("Error fetching recipients:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipients" },
      { status: 500 }
    );
  }
}
