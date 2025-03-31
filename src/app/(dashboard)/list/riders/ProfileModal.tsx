import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { exportToCSV } from "@/lib/exportCSV";

interface ProfileModalProps {
  riderId: string;
  onClose: () => void;
  onStatusToggle: (id: string, updatedStatus: string) => void;
  onRiderDeleted: any;
}

const formatDateJoined = (isoString: string): string => {
  const date = new Date(isoString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${month} ${year} at ${time.toLowerCase()}`;
};

export const ProfileModal: React.FC<ProfileModalProps> = ({
  riderId,
  onClose,
  onStatusToggle,
  onRiderDeleted,
}) => {
  const [rider, setRider] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRider = useCallback(async () => {
    if (!riderId) return;
    setLoading(true);

    try {
      console.log(`Fetching updated details for Rider: ${riderId}`);
      const response = await fetch(`/api/riders/${riderId}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch rider");
      const data = await response.json();

      if (data.status === "success" && data.rider) {
        console.log("Rider Status:", data.rider.status);
        setRider(data.rider);
      }
    } catch (error) {
      console.error("Error Fetching rider:", error);
    } finally {
      setLoading(false);
    }
  }, [riderId]);

  useEffect(() => {
    if (!riderId) return;
    fetchRider();
  }, [riderId, fetchRider]);

  // Correctly determine active status from rider data
  const isActive = rider?.status?.toLowerCase() === "active";

  const toggleStatus = async () => {
    if (!rider || isUpdating) return;
    setIsUpdating(true);

    const currentStatus = rider.status?.toLowerCase();
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = currentStatus === "active" ? "deactivate" : "activate";

    // updating the ui first
    setRider((prev: any) => (prev ? { ...prev, status: newStatus } : prev));

    try {
      const response = await fetch(`/api/riders/${rider._id}/${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} rider`);
      }

      onStatusToggle(rider._id, newStatus);
      // fetch latest data in the background (1 sec delay)
    } catch (error) {
      console.error("Error updating status:", error);

      // revert ui change if request fails
      setRider((prev: any) =>
        prev ? { ...prev, status: currentStatus } : prev
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // selected image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // debug state loads
  useEffect(() => {
    console.log("Updated Rider:", rider); // Check if state updates after toggle
  }, [rider]);

  async function deleteRiderRoute(riderId: string) {
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/riders/${riderId}/delete`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete rider`);
      }

      alert("Deleted successfully!");
      setDeleteMode(false);
      onClose();

      // fetch latest data in the background (1 sec delay)
      onRiderDeleted();
    } catch (error) {
      console.error("Error deleting rider:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  // delete rider
  const deleteRider = () => {
    return (
      <motion.div
        className="bg-white-500 z-50 p-6 rounded-lg shadow-lg w-[90%] max-w-lg max-h-[90vh] sm:w-[400px] transition-all duration-300 overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* CLOSE BUTTON */}
        <button
          className="absolute top-3 right-3 text-red-600 hover:text-red-500 text-xl"
          onClick={() => setDeleteMode(false)}
        >
          X
        </button>

        {/* header */}
        <h2 className="text-center bg-color1 text-white p-2 rounded-full">
          Confirm delete <strong>{rider.firstname}</strong>
        </h2>

        {/* confirm message */}
        <p className="text-center p-4">
          This will delete <strong>{rider.firstname}</strong> details
          permanently? <br /> You can rather deactivate the rider if you
          don&amp;t mean to delete permanently{" "}
        </p>

        {/* CLOSE  BUTTON */}
        <div className="mt-6 flex justify-between">
          {/* EXPORT BUTTON */}
          <button
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-500"
            onClick={() => setDeleteMode(false)}
          >
            Cancel
          </button>

          {/* CLOSE BUTTON */}
          <button
            className="bg-red-400 text-white px-4 py-2 rounded-md hover:bg-red-500"
            onClick={() => deleteRiderRoute(rider._id)}
          >
            Yes
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg max-h-[90vh] sm:w-[400px] transition-all duration-300 overflow-y-auto ${
          isActive ? "opacity-100" : "opacity-40"
        }`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* CLOSE BUTTON */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          X
        </button>
        {/* loading and error states */}
        {loading ? (
          <p className="text-center p-4">Loading rider details...</p>
        ) : !rider ? (
          <p className="text-center p-4">Rider not found...</p>
        ) : (
          <>
            {/* STATUS TOGGLE */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-gray-700 font-medium">Status</p>
              <div
                className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-all ${
                  isActive ? "bg-color2" : "bg-red-400"
                } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={toggleStatus}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{ x: isActive ? 24 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>

            {/* PROFILE IMAGE */}
            <div className="mt-12 justify-center flex">
              <Image
                src={rider.facial_picture_url || "/placeholder.jpg"}
                alt={`${rider.firstname} ${rider.lastname}`}
                width={100}
                height={100}
                className="rounded-full object-cover border-2 border-gray-300"
              />
            </div>

            {/* PROFILE INFO */}
            <div className="text-center mt-4">
              <h2 className="text-lg font-semibold">
                {rider.firstname} {rider.lastname}
              </h2>
              <p className="text-gray-500">
                {" "}
                <strong>Gender:</strong> {rider.gender}
              </p>
              <p className="text-gray-500">
                <strong>Email:</strong> {rider?.email || "N/A"}
              </p>
              <p className="text-gray-500">
                <strong>Phone:</strong> {rider.phone}
              </p>
              <p className="text-gray-500">
                <strong>Date Joined:</strong>{" "}
                {formatDateJoined(rider.date_joined)}
              </p>
              <p className="text-gray-500">
                <strong>Vehicle Type:</strong> {rider.vehicle_type}
              </p>
              <p className="text-gray-500">
                <strong>Address:</strong> {rider.homeaddressdetails}
              </p>
              <p className="text-gray-500">
                {" "}
                <strong>Nin:</strong> {rider?.nin || "N/A"}
              </p>
              <p className="text-gray-500">
                {" "}
                <strong>Bvn:</strong> {rider?.bvn || "N/A"}
              </p>
            </div>

            {/* RATINGS */}
            <div className="mt-4">
              <p className="text-gray-600 font-medium">Ratings</p>
              <div className="flex items-center space-x-1">
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <span
                      key={index}
                      className={`text-color2/40 ${
                        index < rider.ratings ? "opacity-100" : "opacity-20"
                      }`}
                    >
                      ★
                    </span>
                  ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-color2/40 h-2 rounded-full"
                  style={{ width: `${(rider.ratings / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* ACCOUNT DETAILS */}
            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
              <h3 className="text-gray-700 font-semibold mb-2">
                Account Details
              </h3>
              <p className="text-gray-600">
                <strong>Bank:</strong> {rider.accountbank}
              </p>
              <p className="text-gray-600">
                <strong>Account Name:</strong> {rider.accountname}
              </p>
              <p className="text-gray-600">
                <strong>Acount Number:</strong> {rider.accountnumber}
              </p>
              <p className="text-gray-600">
                <strong>Earnings:</strong>{" "}
                {rider.earnings ? rider.earnings.toLocaleString() : "N/A"}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-gray-700 font-semibold mb-2">Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "National ID",
                    url: rider.file_ids?.nationalid ?? "N/A",
                  },
                  {
                    label: "Utility Bill",
                    url: rider.file_ids?.utility_bill ?? "N/A",
                  },
                  {
                    label: "Driver's License",
                    url:
                      rider.file_ids?.riders_license ||
                      rider.file_ids?.drivers_license ||
                      "N/A",
                  },
                  {
                    label: "Vehicle Papers",
                    url:
                      rider.file_ids?.bike_papers ||
                      rider.file_ids?.lorry_papers ||
                      rider.file_ids?.vehicle_papers ||
                      "N/A",
                  },
                ]
                  .filter((doc) => doc.url && doc.url !== "N/A")
                  .map((doc, index) => (
                    <div
                      key={index}
                      className="relative cursor-pointer"
                      onClick={() =>
                        setSelectedImage(
                          doc.url
                            ? `https://deliveryapi-plum.vercel.app/files/${doc.url}`
                            : `/placeholder.jpeg`
                        )
                      }
                    >
                      <Image
                        src={
                          doc.url
                            ? `https://deliveryapi-plum.vercel.app/files/${doc.url}`
                            : `/placeholder.jpeg`
                        }
                        alt={doc.label}
                        width={100}
                        height={80}
                        className="rounded-md object-cover border border-gray-300"
                      />
                      <p className="text-xs text-gray-500 text-center mt-1">
                        {doc.label}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* LIGHTBOX (click to enlarge function) */}
            {selectedImage && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
              >
                <div className="relative">
                  <button
                    className="absolute top-2 right-2 text-white text-xl"
                    onClick={() => setSelectedImage(null)}
                  >
                    X
                  </button>
                  <Image
                    src={selectedImage}
                    alt="Enlarged Document"
                    width={400}
                    height={400}
                    className="rounded-md max-w-full max-h-[80vh] object-contain"
                  />
                </div>
              </motion.div>
            )}
            {/* BUTTONS */}
            <div className="mt-6 flex justify-between">
              {/* EXPORT BUTTON */}
              <button
                className="bg-color2/80 text-white px-4 py-2 rounded-md hover:bg-color2/50"
                onClick={() => exportToCSV(rider)}
              >
                Export CSV
              </button>

              {/* CLOSE BUTTON */}
              <button
                className="bg-color1/40 text-white px-4 py-2 rounded-md hover:bg-color1/50"
                onClick={onClose}
              >
                Close
              </button>

              {/* DELETE BUTTON */}
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-500"
                onClick={() => setDeleteMode(true)}
              >
                Delete
              </button>

              {deleteMode && (
                <motion.div
                  className="fixed inset-0 flex items-center justify-center bg-black-300 backdrop-blur-md p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {deleteRider()}
                </motion.div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
