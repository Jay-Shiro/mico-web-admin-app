"use client";

import { useState } from "react";
import {
  X,
  RefreshCcw,
  Trash2,
  Download,
  User,
  Bike,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { RiderInfo } from "@/lib/types";

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

interface ArchivedDeliveryDetailsModalProps {
  delivery: ArchivedDelivery;
  onClose: () => void;
  onDeliveryAction: (type: "restore" | "delete") => Promise<void>;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ArchivedDeliveryDetailsModal({
  delivery,
  onClose,
  onDeliveryAction,
}: ArchivedDeliveryDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleExport = () => {
    // Export delivery data to CSV
    const csvContent = Object.entries(delivery)
      .map(([key, value]) => `${key},${JSON.stringify(value)}`)
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delivery-${delivery._id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRestore = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await onDeliveryAction("restore");
      toast.success("Delivery restored successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to restore delivery");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await onDeliveryAction("delete");
      toast.success("Delivery permanently deleted");
      onClose();
    } catch (error) {
      toast.error("Failed to delete delivery");
    } finally {
      setIsLoading(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Delivery Details</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Export"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleRestore}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Restore"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-full text-red-500"
              title="Delete Permanently"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {delivery.user?.name || "Unknown"}
                    </p>
                    {delivery.user?.email && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail className="w-4 h-4" />
                        <p>{delivery.user.email}</p>
                      </div>
                    )}
                    {delivery.user?.phone && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Phone className="w-4 h-4" />
                        <p>{delivery.user.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Rider Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bike className="w-5 h-5 text-gray-400" />
                  <div>
                    {delivery.rider ? (
                      <>
                        <p className="font-medium">{delivery.rider.name}</p>
                        {delivery.rider.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="w-4 h-4" />
                            <p>{delivery.rider.email}</p>
                          </div>
                        )}
                        {delivery.rider.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="w-4 h-4" />
                            <p>{delivery.rider.phone}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="font-medium text-gray-500">Not Assigned</p>
                    )}
                  </div>
                </div>

                {delivery.rejected_riders &&
                  delivery.rejected_riders.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">
                        Rejected Riders:
                      </p>
                      <div className="space-y-2">
                        {delivery.rejected_riders.map((rejectedRider) => (
                          <div
                            key={rejectedRider.id}
                            className="flex items-center gap-2 ml-2 text-sm"
                          >
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{rejectedRider.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Delivery Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Delivery ID</p>
                  <p className="font-medium">{delivery._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Original ID</p>
                  <p className="font-medium">{delivery.archived_from_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-medium">From: {delivery.startpoint}</p>
                  <p className="font-medium">To: {delivery.endpoint}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Distance</p>
                  <p className="font-medium">{delivery.distance}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Transaction Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">
                    ₦{delivery.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p
                    className={`font-medium ${
                      delivery.transaction_info.payment_status === "paid"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {delivery.transaction_info.payment_status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="font-medium">
                    {delivery.transaction_info.payment_date
                      ? formatDate(delivery.transaction_info.payment_date)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Delivery Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Type</p>
                  <p className="font-medium">{delivery.vehicletype}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Package Size</p>
                  <p className="font-medium">{delivery.packagesize}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivery Speed</p>
                  <p className="font-medium">{delivery.deliveryspeed}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Archive Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Archived Date</p>
                  <p className="font-medium">
                    {formatDate(delivery.archived_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {delivery.transaction_info.last_updated
                      ? formatDate(delivery.transaction_info.last_updated)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4">
                Confirm Permanent Delete
              </h3>
              <p className="mb-6">
                Are you sure you want to permanently delete this delivery? This
                action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  {isLoading ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
