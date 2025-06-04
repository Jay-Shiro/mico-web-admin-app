"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Search, MoreVertical, User, Bike } from "lucide-react";
import Card from "@/components/ui/Card";
import { toast } from "react-hot-toast";
import ArchivedDeliveryDetailsModal from "@/components/archived/ArchivedDeliveryDetailsModal";
import { RiderInfo } from "@/lib/types";

// Types
interface ArchivedDelivery {
  _id: string;
  user_id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  rider: RiderInfo | null;
  rejected_riders?: RiderInfo[];
  price: number;
  distance: string;
  startpoint: string;
  endpoint: string;
  vehicletype: string;
  transactiontype: string;
  packagesize: string;
  deliveryspeed: string;
  status: any;
  transaction_info: {
    payment_status: string;
    payment_date: string;
    amount_paid: number;
    payment_reference: string | null;
    last_updated: string;
  };
  archived_at: string;
  archived_from_id: string;
  rider_location?: {
    rider_id: string;
    latitude: number;
    longitude: number;
    last_updated: string;
  };
}

interface SearchInputProps {
  input: string;
  setInput: (value: string) => void;
}

const SearchInput = ({ input, setInput }: SearchInputProps) => {
  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search by ID, location, or status..."
        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
      />
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={20}
      />
    </div>
  );
};

const ArchivedDeliveriesPage = () => {
  const { data: session } = useSession();
  const [archivedDeliveries, setArchivedDeliveries] = useState<
    ArchivedDelivery[]
  >([]);
  const [searchInput, setSearchInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] =
    useState<ArchivedDelivery | null>(null);

  // Fetch archived deliveries
  const fetchArchivedDeliveries = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/deliveries/archived");
      if (!response.ok) throw new Error("Failed to fetch archived deliveries");
      const data = await response.json();
      setArchivedDeliveries(data.archived_deliveries);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch archived deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedDeliveries();
  }, []);

  // Filter and sort deliveries based on search input
  const filteredDeliveries = archivedDeliveries
    .filter((delivery) => {
      const searchTerm = searchInput.toLowerCase();
      return (
        delivery._id.toLowerCase().includes(searchTerm) ||
        delivery.startpoint.toLowerCase().includes(searchTerm) ||
        delivery.endpoint.toLowerCase().includes(searchTerm) ||
        delivery.status?.deliverystatus?.toLowerCase().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      // Sort by archived_at date in descending order (newest first)
      const dateA = new Date(a.archived_at).getTime();
      const dateB = new Date(b.archived_at).getTime();
      return dateB - dateA;
    });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeliveryAction = async (
    deliveryId: string,
    type: "restore" | "delete"
  ) => {
    try {
      const endpoint = type === "restore" ? "restore" : "permanent-delete";
      const method = type === "restore" ? "POST" : "DELETE";

      const response = await fetch(
        `/api/deliveries/${deliveryId}/${endpoint}`,
        {
          method,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${type} delivery`);
      }

      // Refresh the list after successful action
      await fetchArchivedDeliveries();
    } catch (error) {
      throw error;
    }
  };

  if (!session?.user?.role || session.user.role !== "admin") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
        <p className="mt-2">
          You do not have permission to view archived deliveries.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Archived Deliveries</h1>
        <SearchInput input={searchInput} setInput={setSearchInput} />
      </div>

      <div className="space-y-4">
        {filteredDeliveries.map((delivery) => (
          <Card
            key={delivery._id}
            className="p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                <div>
                  <p className="text-sm text-gray-500">Delivery ID</p>
                  <p className="font-medium">{delivery._id}</p>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Customer</p>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <p className="font-medium">
                        {delivery.user?.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                  {delivery.rider && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Rider</p>
                      <div className="flex items-center gap-2">
                        <Bike size={16} className="text-gray-400" />
                        <p className="font-medium">{delivery.rider.name}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-medium">
                    {delivery.startpoint} → {delivery.endpoint}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Details</p>
                  <p className="font-medium">
                    {delivery.vehicletype} • {delivery.packagesize} •{" "}
                    {delivery.deliveryspeed}
                  </p>
                  <p className="text-sm mt-1">
                    <span
                      className={`font-medium ${
                        delivery.transaction_info.payment_status === "paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {delivery.transaction_info.payment_status}
                    </span>
                    {" • "}₦{delivery.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Archived Date</p>
                  <p className="font-medium">
                    {formatDate(delivery.archived_at)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Distance</p>
                  <p className="font-medium">{delivery.distance}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDelivery(delivery)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </Card>
        ))}

        {filteredDeliveries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No archived deliveries found</p>
          </div>
        )}
      </div>

      {selectedDelivery && (
        <ArchivedDeliveryDetailsModal
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          onDeliveryAction={(type) =>
            handleDeliveryAction(selectedDelivery._id, type)
          }
        />
      )}
    </div>
  );
};

export default ArchivedDeliveriesPage;
