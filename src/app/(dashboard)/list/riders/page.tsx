"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
// import { ridersData } from "@/lib/data";
import { Eye } from "lucide-react";
import { ProfileModal } from "./ProfileModal";
import { Rider } from "./riderType";
import { exportAllRidersToCSV } from "@/lib/exportCSV";

const RidersListPage = () => {
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [ridersData, setRidersData] = useState<Rider[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // fetch riders data from API

  const fetchRiders = async () => {
    try {
      const response = await fetch("/api/riders", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch riders data");

      const data = await response.json();
      if (Array.isArray(data.riders)) {
        setRidersData(data.riders);
        setFilteredRiders(data.riders);
      }
    } catch (error) {
      console.error("Error fetching riders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  // filter riders based on search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = ridersData.filter((rider) =>
        `${rider.firstname} ${rider.lastname} ${rider.email} ${rider.status} ${rider.homeaddressdetails}`
          .toLowerCase()
          .includes(searchInput.toLowerCase())
      );
      setFilteredRiders(filtered);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [searchInput, ridersData]);

  // rider's status
  const handleStatusToggle = async (riderId: string, updatedStatus: string) => {
    console.log("Updating status:", riderId, updatedStatus);

    setRidersData((prev) =>
      prev.map((rider) =>
        rider._id === riderId
          ? { ...rider, status: updatedStatus.toLowerCase() }
          : rider
      )
    );

    setFilteredRiders((prev) =>
      prev.map((rider) =>
        rider._id === riderId
          ? { ...rider, status: updatedStatus.toLowerCase() }
          : rider
      )
    );

    // update current selected rider
    if (selectedRider?._id === riderId) {
      setSelectedRider((prev) =>
        prev ? { ...prev, status: updatedStatus.toLowerCase() } : null
      );
    }

    // Re-fetch just the rider (for performance)
    try {
      const response = await fetch(`/api/riders/${riderId}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to fetch updated rider data");

      const { rider } = await response.json();
      if (rider) {
        // update local state with the fetched rider
        setRidersData((prev) =>
          prev.map((r) => (r._id === riderId ? rider : r))
        );

        setFilteredRiders((prev) =>
          prev.map((r) => (r._id === riderId ? rider : r))
        );

        // Update selected rider
        if (selectedRider?._id === riderId) {
          setSelectedRider(rider);
        }
      }
    } catch (error) {
      console.error("Error fetching updated rider:", error);
    }
  };

  return (
    <>
      {/*TOP*/}
      <div className="bg-white p-4 h-[173px] rounded-md flex flex-col m-4 mt-0 justify-between">
        <h1 className="text-2xl text-color1 font-semibold">Manage Riders</h1>
        <SearchInput input={searchInput} setInput={setSearchInput} />
      </div>

      {/*BOTTOM*/}
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-wrap justify-between">
          <h1 className="hidden md:block text-lg text-color1 font-semibold p-2">
            All Riders
          </h1>
          <button
            className="flex items-center bg-color1 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-opacity-80 focus:ring-2 focus:ring-color1 transition"
            onClick={() => exportAllRidersToCSV(ridersData)}
          >
            Export Riders
          </button>
        </div>
      </div>
      {/* PAGINATION */}
      {loading ? (
        <div className="text-center text-color1 p-4">Loading riders...</div>
      ) : (
        <div className="bg-white/50 p-4 rounded-md flex-1 m-4 mt-0 text-black/80">
          {/* HEADER ROW */}
          <div className="hidden md:grid grid-cols-7 gap-4 bg-white/5 text-black/50 font-semibold p-3 rounded-md">
            <span className="text-center">Profile</span>
            <span className="text-center">Full Name</span>
            <span className="text-center">Gender</span>
            <span className="text-center">Email</span>
            <span className="text-center">Status</span>
            <span className="text-center">Vehicle</span>
            <span className="text-center">Details</span>
          </div>

          {/* SCROLLABLE MOBILE VIEW */}
          <div className="md:hidden bg-white/5 text-black/50 font-semibold p-3 rounded-md text-center">
            {filteredRiders.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No result found for &quot;{searchInput}&quot;
              </div>
            ) : (
              "All Riders"
            )}
          </div>

          {/* DATA ROWS */}
          <div className="overflow-auto md:overflow-visible">
            {filteredRiders.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No results found for &quot;{searchInput}&quot;
              </div>
            ) : (
              filteredRiders.map((rider) => (
                <div
                  className="grid grid-cols-2 md:grid-cols-7 gap-4 items-center border-b border-gray-200 p-3"
                  key={rider._id}
                >
                  {/* PROFILE IMAGE */}
                  <div className="flex justify-center">
                    <Image
                      src={rider.facial_photo_url}
                      alt={`${rider.firstname} ${rider.lastname}`}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                  </div>

                  {/* RIDER INFO */}
                  <span className="text-xs sm:text-sm md:text-base font-medium text-center">
                    {rider.firstname} {rider.lastname}
                  </span>

                  <span className="text-xs sm:text-sm md:text-base text-center">
                    {rider.gender}
                  </span>

                  <span className="text-xs sm:text-sm md:text-base truncate text-center">
                    {rider.email}
                  </span>

                  <span
                    className={`text-xs font-semibold rounded-full text-center px-3 py-1 w-full md:w-auto ${
                      rider.status?.toLowerCase() === "active"
                        ? "bg-color2/20 text-color2/80"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {rider.status}
                  </span>

                  <span className="text-xs sm:text-sm md:text-base text-center">
                    {rider.vehicle_type}
                  </span>

                  {/* VIEW PROFILE */}
                  <button
                    className="flex items-center justify-center text-color1/60 hover:text-color1/70 transition duration-200"
                    title={`View ${rider.firstname}'s profile`}
                    onClick={() => setSelectedRider(rider)}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {selectedRider && (
        <ProfileModal
          riderId={selectedRider._id}
          onClose={() => setSelectedRider(null)}
          onStatusToggle={handleStatusToggle}
          onRiderDeleted={fetchRiders}
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
          placeholder="Search riders by Name, Email, Status, Address..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
    </>
  );
};

export default RidersListPage;
