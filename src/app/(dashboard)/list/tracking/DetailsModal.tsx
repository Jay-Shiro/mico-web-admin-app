import { motion } from "framer-motion";
import React from "react";
import { DeliveryType } from "./deliveryType";
import { exportDeliveryToCSV } from "@/lib/exportCSV";
import { FaMotorcycle, FaCar } from "react-icons/fa";
import { DistanceDisplay } from "./DistanceDisplay";
import { Refresh } from "./Refresh";
import { Rider } from "@/app/(dashboard)/list/riders/riderType";

interface DetailsModalProps {
  delivery: DeliveryType;
  onClose: () => void;
  onStatusToggle: (id: string, updateStatus: string) => void;
  deliveriesData: DeliveryType[]; // Added this line
  ridersData: Rider[];
  rider?: Rider;
}

interface DeliverySpeedGraphProps {
  speed: "standard" | "express";
}

const handleRefresh = () => {
  console.log("Refreshing...");
};

const formatDateJoined = (isoString: string | null): string => {
  if (!isoString) return "N/A";
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

export const DetailsModal: React.FC<DetailsModalProps> = ({
  delivery,
  onClose,
}) => {
  if (!delivery) return null;

  const getPackageSizeBox = (size?: string) => {
    return (
      <div className="relative flex flex-col items-center group">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-color2/30 rounded flex justify-center items-center w-10 h-10"
        >
          <svg width="40" height="40" className="bg-gray-300 rounded">
            <rect width="40" height="40" fill="#D1D5DB" />
          </svg>
        </motion.div>
        <span className="text-color2/60 text-sm md:hidden">
          {size || "N/A"}
        </span>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bottom-full mt-3 bg-color2/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
        >
          {size || "N/A"}
        </motion.div>
      </div>
    );
  };

  const DeliverySpeedGraph: React.FC<DeliverySpeedGraphProps> = ({ speed }) => {
    const curvePath =
      speed === "standard"
        ? "M 10 40 Q 50, 90 90 40"
        : "M 10 40 Q 80, 10 90 40";

    return (
      <div className="relative flex flex-col items-center">
        <motion.svg
          width="100"
          height="70"
          viewBox="0 0 100 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeIn" }}
        >
          <motion.path
            d={curvePath}
            stroke="#2563EB"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
        </motion.svg>
        <span className="text-color2/50 text-sm">{speed} delivery</span>
      </div>
    );
  };

  const formatTransactionInfo = (delivery: DeliveryType) => {
    const paymentStatus =
      delivery.status?.transactioninfo?.status?.toLowerCase() || "pending";
    const paymentMethod = delivery.transactiontype;

    const statusStyles: Record<string, string> = {
      paid: "bg-color2/50",
      pending: "bg-color2/40",
      failed: "bg-red-200",
    };

    const typeLabels: Record<string, string> = {
      cash: "Cash",
      card: "Card",
    };

    return {
      statusStyles: statusStyles[paymentStatus] || "bg-gray-200",
      formattedType: typeLabels[paymentMethod] || "Unknown",
    };
  };

  const { statusStyles, formattedType } = formatTransactionInfo(delivery);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
        onClick={onClose}
      >
        ✕
      </button>

      <motion.div
        className="bg-white pt-4 p-8 rounded-lg shadow-lg w-[90%] max-w-lg max-h-[90vh] sm:w-[500px] overflow-y-auto relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Status section */}
        <div className="mb-8">
          <Refresh onRefresh={handleRefresh} />
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-700 font-medium">Status:</p>
            <span
              className={`px-4 py-1.5 rounded-lg text-white text-sm ${
                delivery.status.current === "in transit"
                  ? "bg-color2/20"
                  : delivery.status.current === "completed"
                  ? "bg-color2/80"
                  : "bg-color1/50"
              }`}
            >
              {delivery.status.current}
            </span>
          </div>
          <div className="mt-2 text-gray-500 space-y-1">
            <p className="text-sm">
              Last Updated: {formatDateJoined(delivery?.last_updated ?? null)}
            </p>
            <p className="text-sm opacity-35">
              Payment Date:{" "}
              {formatDateJoined(
                delivery.transaction_info?.payment_date ?? null
              )}
            </p>
          </div>
        </div>

        {/* Vehicle icon */}
        <div className="flex justify-center mb-8">
          {delivery.vehicletype.toLowerCase() === "bike" ? (
            <FaMotorcycle className="text-6xl text-color2" />
          ) : (
            <FaCar className="text-6xl text-color2" />
          )}
          <strong className="text-center">{delivery.vehicletype}</strong>
        </div>

        {/* Delivery details grid */}
        <div className="mb-8">
          {/* Package Size and Delivery Speed row */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <span className="font-medium mb-2">Package Size</span>
              {getPackageSizeBox(delivery.packagesize)}
            </div>
            <div className="flex flex-col items-center">
              <span className="font-medium mb-2">Delivery Speed</span>
              <DeliverySpeedGraph
                speed={delivery.deliveryspeed as "standard" | "express"}
              />
            </div>
          </div>

          {/* Distance information in its own section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <DistanceDisplay
              from={delivery.startpoint}
              to={delivery.endpoint}
              distance={delivery.distance}
            />
          </div>
        </div>

        {/* User & Rider badge */}
        <div className="bg-color1/10 px-4 py-3 rounded-lg text-center mb-8">
          <p className="font-medium">
            Belonging to: {delivery.user?.firstname} {delivery.user?.lastname}
          </p>
          <p className="font-medium opacity-60 mt-2">
            Delivered by: {delivery.rider?.firstname} {delivery.rider?.lastname}
          </p>
        </div>

        {/* Transaction details */}
        <div className="bg-color1/10 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <strong className="text-gray-700">Transaction Info</strong>
            <span className="text-sm text-gray-500">
              {formatDateJoined(delivery.transaction_info?.payment_date)}
            </span>
          </div>

          <div className="text-right text-red-600 font-bold text-2xl mb-4">
            ₦{delivery.price}
          </div>

          <div className="space-y-2">
            <p className="text-gray-700 flex justify-between">
              <span>Transaction Type:</span>
              <span className="font-medium">{formattedType}</span>
            </p>
            <p className="text-gray-700 flex justify-between items-center">
              <span>Payment Status:</span>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${statusStyles}`} />
                <span className="text-sm capitalize">
                  {delivery.transaction_info?.payment_status}
                </span>
              </div>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between gap-4">
          <button
            className="flex-1 bg-color2/40 text-color1 px-3 py-1.5 rounded-md hover:bg-color2/50 transition-colors"
            onClick={() => exportDeliveryToCSV(delivery)}
          >
            Export CSV
          </button>
          <button
            className="flex-1 bg-color1/40 text-white px-3 py-1.5 rounded-md hover:bg-color1/50 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          <button className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
