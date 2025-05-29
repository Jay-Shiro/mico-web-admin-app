const BASE_URL = process.env.NEXT_API_BASE_URL;
const ADMIN_KEY = process.env.NEXT_ADMIN_DELETE_KEY;

export async function POST(
  req: Request,
  { params }: { params: { deliveryId: string } }
) {
  try {
    const { deliveryId } = params;

    const response = await fetch(
      `${BASE_URL}/deliveries/${deliveryId}/restore?admin_key=${ADMIN_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to restore delivery: ${response.statusText}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error("Error restoring delivery:", error);
    return Response.json(
      { error: "Failed to restore delivery" },
      { status: 500 }
    );
  }
}
