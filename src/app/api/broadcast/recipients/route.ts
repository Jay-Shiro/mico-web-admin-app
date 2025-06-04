import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function GET() {
  try {
    // Common fetch options
    const fetchOptions = {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store" as RequestCache,
    };

    // Fetch users and riders data in parallel
    const [usersResponse, ridersResponse] = await Promise.all([
      fetch(`${BASE_URL}/users`, fetchOptions),
      fetch(`${BASE_URL}/riders`, fetchOptions),
    ]);

    if (!usersResponse.ok || !ridersResponse.ok) {
      throw new Error("Failed to fetch users or riders data");
    }

    const usersData = await usersResponse.json();
    const ridersData = await ridersResponse.json();

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
      branding: rider.branding || "no",
      dateJoined: rider.date_joined || "",
      type: "rider",
      address: rider.homeaddressdetails || "",
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
