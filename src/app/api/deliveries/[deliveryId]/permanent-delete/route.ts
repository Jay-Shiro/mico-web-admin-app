const BASE_URL = process.env.NEXT_API_BASE_URL;
const ADMIN_KEY = process.env.NEXT_ADMIN_DELETE_KEY;

export async function DELETE(
  req: Request,
  { params }: { params: { deliveryId: string } }
) {
  try {
    const { deliveryId } = params;

    const response = await fetch(
      `${BASE_URL}/deliveries/permanent-delete/${deliveryId}?admin_key=${ADMIN_KEY}&from_archive=true`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to permanently delete delivery: ${response.statusText}`
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error("Error permanently deleting delivery:", error);
    return Response.json(
      { error: "Failed to permanently delete delivery" },
      { status: 500 }
    );
  }
}
