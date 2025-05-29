const BASE_URL = process.env.NEXT_API_BASE_URL;
const ADMIN_KEY = process.env.NEXT_ADMIN_DELETE_KEY;

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

interface Rider {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

interface RiderInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export async function GET() {
  try {
    // Check if required environment variables are set
    if (!BASE_URL) {
      throw new Error("NEXT_API_BASE_URL is not set");
    }

    if (!ADMIN_KEY) {
      throw new Error("NEXT_ADMIN_DELETE_KEY is not set");
    }

    // Common fetch options
    const fetchOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store" as RequestCache,
    };

    // Fetch archived deliveries, users, and riders data in parallel
    const [archivedResponse, usersResponse, ridersResponse] = await Promise.all(
      [
        fetch(
          `${BASE_URL}/deliveries/archived?admin_key=${ADMIN_KEY}`,
          fetchOptions
        ),
        fetch(`${BASE_URL}/users`, fetchOptions),
        fetch(`${BASE_URL}/riders`, fetchOptions),
      ]
    );

    if (!archivedResponse.ok) {
      throw new Error(
        `Failed to fetch archived deliveries: ${archivedResponse.statusText}`
      );
    }

    const archivedData = await archivedResponse.json();
    const usersData = await usersResponse.json();
    const ridersData = await ridersResponse.json();

    // Create maps for quick lookups
    const usersMap = new Map(
      ((usersData.users as User[]) || []).map((user) => [user._id, user])
    );
    const ridersMap = new Map(
      ((ridersData.riders as Rider[]) || []).map((rider) => [rider._id, rider])
    );

    // Enhance archived deliveries with user and rider data
    const enhancedDeliveries = archivedData.archived_deliveries.map(
      (delivery: any) => {
        const user = usersMap.get(delivery.user_id) as User | undefined;

        // Get rider ID from rider_location field as it seems to be the most accurate
        let riderId: string | null = delivery.rider_location?.rider_id;
        if (riderId === "null" || riderId === "None") {
          riderId = null;
        }

        const rider = riderId
          ? (ridersMap.get(riderId) as Rider | undefined)
          : null;

        // Map rejected riders data with proper typing
        const rejectedRiders = (delivery.rejected_riders || [])
          .map((rejectedId: string) => {
            const rejectedRider = ridersMap.get(rejectedId) as
              | Rider
              | undefined;
            if (!rejectedRider) return null;

            const riderInfo: RiderInfo = {
              id: rejectedRider._id,
              name: `${rejectedRider.firstname} ${rejectedRider.lastname}`.trim(),
              email: rejectedRider.email,
              phone: rejectedRider.phone,
            };
            return riderInfo;
          })
          .filter((r: RiderInfo | null): r is RiderInfo => r !== null);

        return {
          ...delivery,
          user: user
            ? {
                id: user._id,
                name: `${user.firstname} ${user.lastname}`.trim(),
                email: user.email,
                phone: user.phone,
              }
            : null,
          rider: rider
            ? {
                id: rider._id,
                name: `${rider.firstname} ${rider.lastname}`.trim(),
                email: rider.email,
                phone: rider.phone,
              }
            : null,
          rejected_riders: rejectedRiders,
        };
      }
    );

    // Return the enhanced data
    return Response.json({
      status: "success",
      archived_deliveries: enhancedDeliveries,
      count: archivedData.count,
    });
  } catch (error: any) {
    console.error("Error fetching archived deliveries:", error);
    return Response.json(
      { error: error.message || "Failed to fetch archived deliveries" },
      { status: 500 }
    );
  }
}
