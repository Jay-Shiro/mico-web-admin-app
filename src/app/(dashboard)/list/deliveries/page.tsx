"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { deliveriesData, ridersData } from "@/lib/data";
import { Eye } from "lucide-react";
import { DetailsModal } from "./DetailsModal";
import { Delivery } from "./deliveryType";
import { exportAllDeliveriesToCSV } from "@/lib/exportCSV";
import { FaMotorcycle, FaCar } from "react-icons/fa";

const DeliveriesListPage = () => {
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [searchInput, setSearchInput] = useState<string>("");
  const [filteredDeliveries, setFilteredDeliveries] =
    useState<Delivery[]>(deliveriesData);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = deliveriesData.filter((delivery) =>
        `${delivery.vehicletype} ${delivery.packagesize} ${delivery.startpoint} ${delivery.distance} ${delivery.status.current} ${delivery.endpoint}`
          .toLowerCase()
          .includes(searchInput.toLowerCase())
      );
      setFilteredDeliveries(filtered);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  return (
    <>
      {/*TOP*/}
      <div className="bg-white p-4 h-[173px] rounded-md flex flex-col m-4 mt-0 justify-between">
        <h1 className="text-2xl text-color1 font-semibold">
          Manage Deliveries
        </h1>
        <SearchInput input={searchInput} setInput={setSearchInput} />
      </div>

      {/*BOTTOM*/}
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-wrap justify-between">
          <h1 className="hidden md:block text-lg text-color1 font-semibold p-2">
            All Deliveries
          </h1>
          <button
            className="flex items-center bg-color1 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-opacity-80 focus:ring-2 focus:ring-color1 transition"
            onClick={() => exportAllDeliveriesToCSV(deliveriesData)}
          >
            Export Deliveries
          </button>
        </div>
      </div>
      {/* PAGINATION */}
      <div className="bg-white/50 p-4 rounded-md flex-1 m-4 mt-0 text-black/80">
        {/* HEADER ROW */}
        <div className="hidden md:grid grid-cols-7 gap-4 bg-white/5 text-black/50 font-semibold p-3 rounded-md">
          <span className="text-center">Vehicle</span>
          <span className="text-center">Size</span>
          <span className="text-center">Startpoint</span>
          <span className="text-center">Distance</span>
          <span className="text-center">Status</span>
          <span className="text-center">Endpoint</span>
          <span className="text-center">Details</span>
        </div>

        {/* SCROLLABLE MOBILE VIEW */}
        <div className="md:hidden bg-white/5 text-black/50 font-semibold p-3 rounded-md text-center">
          {filteredDeliveries.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No result found for &quot;{searchInput}&quot;
            </div>
          ) : (
            "All Deliveries"
          )}
        </div>

        {/* DATA ROWS */}
        <div className="overflow-auto md:overflow-visible">
          {filteredDeliveries.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No results found for &quot;{searchInput}&quot;
            </div>
          ) : (
            filteredDeliveries.map((delivery) => (
              <div
                className="grid grid-cols-2 md:grid-cols-7 gap-4 items-center border-b border-gray-200 p-3"
                key={delivery.id}
              >
                {/* Delivery ICON*/}
                <div className="mt-12 justify-center flex">
                  <div className="flex justify-">
                    {delivery.vehicletype.toLowerCase() === "bike" ? (
                      <FaMotorcycle className="text-6xl text-color2" /> // BIKE ICON
                    ) : (
                      // CAR ICON
                      <FaCar className="text-6xl text-color2" />
                    )}
                  </div>
                </div>

                {/* RIDER INFO */}
                <span className="text-xs sm:text-sm md:text-base font-medium text-center">
                  {delivery.packagesize}
                </span>

                <span className="text-xs sm:text-sm md:text-base text-center truncate">
                  {delivery.startpoint}
                </span>

                <span className="text-xs sm:text-sm md:text-base truncate text-center">
                  {delivery.distance}
                </span>

                <span
                  className={`text-xs font-semibold rounded-full text-center px-3 py-1 w-full md:w-auto
                ${
                  delivery.status.current.toLowerCase() === "completed"
                    ? "bg-color2/20 text-color2/80"
                    : "bg-gray-200 text-gray-400"
                }`}
                >
                  {delivery.status.current}
                </span>

                <span className="text-xs sm:text-sm md:text-base text-center truncate">
                  {delivery.endpoint}
                </span>

                {/* VIEW PROFILE */}
                <button
                  className="flex items-center justify-center text-color1/60 hover:text-color1/70 transition duration-200"
                  title={`View ${delivery.id}'s more details`}
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* VIEW PROFILE MODAL */}
      {selectedDelivery && (
        <DetailsModal
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          onStatusToggle={(id, updateStatus) => {
            console.log(`updated delivery ${id} to ${updateStatus}`);
          }}
          rider={
            ridersData.find((r) => r.id === Number(selectedDelivery.rider_id))!
          }
          ridersData={ridersData}
          deliveriesData={deliveriesData}
        />
      )}
      <div></div>
    </>
  );
};

interface SearchInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}

const SearchInput = ({ input, setInput }: SearchInputProps) => {
  return (
    <>
      <div className="flex items-center border rounded-2xl bg-white p-2">
        <input
          type="text"
          className="flex-grow p-1 outline-none text-gray-400"
          placeholder="Search deliveries by Name, Email, Status, Address..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
    </>
  );
};

export default DeliveriesListPage;
