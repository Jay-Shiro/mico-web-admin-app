"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const UserCard = ({ type }: { type: string }) => {
  const [riderCount, setRiderCount] = useState<number>(0);
  const [riderLoading, setRiderLoading] = useState(true);
  const [deliveryCount, setDeliveryCount] = useState<number>(0);
  const [deliveryLoading, setDeliveryLoading] = useState(true);

  useEffect(() => {
    if (type === "Riders") {
      const fetchRiders = async () => {
        try {
          const response = await fetch("/api/riders");
          if (!response.ok) throw new Error("Failed to fetch riders");
          const data = await response.json();
          setRiderCount(data.riders?.length || 0);
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setRiderLoading(false);
        }
      };
      fetchRiders();
    }

    if (type === "Deliveries") {
      const fetchDeliveries = async () => {
        try {
          const response = await fetch("/api/deliveries");
          if (!response.ok) throw new Error("Failed to fetch deliveries");
          const data = await response.json();
          setDeliveryCount(data.deliveries?.length || 0);
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setDeliveryLoading(false);
        }
      };
      fetchDeliveries();
    }
  }, [type]);

  const getValue = () => {
    switch (type) {
      case "Riders":
        return riderLoading ? "..." : riderCount;
      case "Deliveries":
        return deliveryLoading ? "..." : deliveryCount;
      case "Cash Payments":
      case "Online Payments":
        return "2,345"; // Placeholder for payments
      default:
        return "0";
    }
  };

  return (
    <div className="rounded-2xl odd:bg-color1 odd:text-white even:bg-color3 even:text-black p-4 flex-1 min-w-130">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600 md:w-[4%]">
          2024/2025
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">{getValue()}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">{type}</h2>
    </div>
  );
};

export default UserCard;
