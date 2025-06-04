"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CiExport } from "react-icons/ci";
import { IoMdDoneAll } from "react-icons/io";
import { MdDeleteForever, MdOutlineSelectAll } from "react-icons/md";
import { Eye, AlertCircle, RefreshCw, Phone } from "lucide-react"; // Import RefreshCw and Phone icons
import { ProfileModal } from "./ProfileModal";
import { Rider } from "./riderType";
import { exportAllRidersToCSV } from "@/lib/exportCSV";
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { GiCancel } from "react-icons/gi";
import { motion } from "framer-motion";

const RidersListPage = () => {
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [ridersData, setRidersData] = useState<Rider[]>([]);
  const [riderIds, setRiderIds] = useState<string[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selection, setSelection] = useState<boolean>(false);
  const [checkedStates, setCheckedStates] = useState<boolean[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const [updatingMessage, setUpdatingMessage] = useState<string>("");
  const [currentAction, setCurrentAction] = useState<
    "delete" | "activate" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [onlineRidersCount, setOnlineRidersCount] = useState<number>(0);
  const [onlineRiders, setOnlineRiders] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  let text;

  // fetch riders data from API

  const fetchRiders = async () => {
    setError(null); // Reset error state
    setLoading(true);
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
      setError("Failed to load riders. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch online riders
  const fetchOnlineRiders = useCallback(async () => {
    try {
      const response = await fetch("/api/riders/online");
      if (response.ok) {
        const data = await response.json();
        if (data.riders && Array.isArray(data.riders)) {
          // Create a set of online rider IDs with explicit string type
          const onlineIds = new Set<string>(
            data.riders.map((rider: any) => rider._id)
          );
          setOnlineRiders(onlineIds);

          // Update the online riders count
          setOnlineRidersCount(onlineIds.size);

          // Update the is_online property of each rider in the filtered riders list
          setFilteredRiders((currentRiders) =>
            currentRiders.map((rider) => ({
              ...rider,
              is_online: onlineIds.has(rider._id),
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching online riders:", error);
    }
  }, []);

  useEffect(() => {
    fetchRiders();
    // Remove the separate fetchOnlineRidersCount call and just call fetchOnlineRiders
    fetchOnlineRiders();

    // Set up an interval to refresh both online status and count every 30 seconds
    const intervalId = setInterval(fetchOnlineRiders, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchOnlineRiders]);

  // Checked Boxes effects management
  useEffect(() => {
    setCheckedStates(new Array(ridersData.length).fill(false));
  }, [ridersData]);

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

  const handleDeleteRiders = async () => {
    try {
      setUpdating(true);
      setUpdatingMessage("Updating, Please wait....");

      const response = await fetch("/api/riders", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: riderIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete riders");
      }

      setUpdatingMessage("All done...");
    } catch (error) {
      console.error("Error deleting riders:", error);
      setUpdatingMessage("Error deleting riders...");
    } finally {
      // Fetch latest data after all activations/deactivations
      await fetchRiders();
      // Reset selection state
      setSelection(false);
      setCheckedStates(new Array(ridersData.length).fill(false));
      setRiderIds([]);
      setUpdating(false);
      setUpdatingMessage("");
    }
  };

  const handleActivateRiders = async () => {
    try {
      setUpdating(true);
      setUpdatingMessage("Updating, Please wait....");

      // Loop through each selected rider
      for (const riderId of riderIds) {
        const rider = ridersData.find((r) => r._id === riderId);

        if (!rider) {
          console.warn(`Rider with ID ${riderId} not found.`);
          continue; // Skip if rider is not found
        }

        // Determine action based on current status
        const isActive = rider.status?.toLowerCase() === "active";
        const action = isActive ? "deactivate" : "activate";

        // Update UI state optimistically
        await handleStatusToggle(
          riderId,
          rider.status === "active" ? "active" : "inactive"
        );

        // Make API request
        const response = await fetch(`/api/riders/${riderId}/${action}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to ${action} rider ${riderId}`);
        }

        setUpdatingMessage("All done...");
      }
    } catch (error) {
      console.error("Error updating rider status:", error);
      setUpdatingMessage("Error updating riders...");
    } finally {
      // Fetch latest data after all activations/deactivations
      await fetchRiders();
      // Reset selection state
      setSelection(false);
      setCheckedStates(new Array(ridersData.length).fill(false));
      setRiderIds([]);
      setUpdating(false);
      setUpdatingMessage("");
    }
  };

  const handleActions = (kind: string) => {
    if (kind === "show") {
      setSelection(false);
      setCheckedStates(new Array(ridersData.length).fill(false));
      setRiderIds([]);
      setCurrentAction(null);
    } else if (kind === "execute") {
      if (riderIds.length === 0) {
        ("No riders selected");
        return;
      }

      switch (currentAction) {
        case "delete":
          handleDeleteRiders();
          break;
        case "activate":
          handleActivateRiders();
          break;
      }

      // Reset after execution
      setSelection(false);
      setCheckedStates(new Array(ridersData.length).fill(false));
      setRiderIds([]);
      setCurrentAction(null);
    }
    // Reset after execution
    setSelection(false);
    setCheckedStates(new Array(ridersData.length).fill(false));
    setRiderIds([]);
    setCurrentAction(null);
  };

  const handleCheckboxChange = (index: number, isChecked: boolean) => {
    setCheckedStates((prev) => {
      const updatedStates = [...prev];
      updatedStates[index] = isChecked;
      return updatedStates;
    });

    const riderId = filteredRiders[index]._id;

    setRiderIds((prev) => {
      const newIds = isChecked
        ? [...prev, riderId]
        : prev.filter((id) => id !== riderId);

      return newIds;
    });
  };

  const handleSelectAll = () => {
    const selectedAll = checkedStates.every((state) => state);
    const newCheckedStates = new Array(filteredRiders.length).fill(
      !selectedAll
    );

    setCheckedStates(newCheckedStates);
    setRiderIds(!selectedAll ? filteredRiders.map((rider) => rider._id) : []);
  };

  const transformImageUrl = (url: string | null) => {
    if (!url) return "/placeholder.jpg";

    // Extract the ID from the URL
    const id = url.split("/files/").pop();

    // Construct new URL with "ten" instead of "plum"
    return `https://deliveryapi-ten.vercel.app/files/${id}`;
  };

  // Function to handle manual refresh
  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await Promise.all([fetchRiders(), fetchOnlineRiders()]);
    } finally {
      setIsRefreshing(false);
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
        {updating ? (
          <motion.div
            className="text-center w-25 rounded-md font-semibold text-color1"
            animate={{ marginTop: ["1em", "2em"] }}
            transition={{ duration: 1.5 }}
          >
            <span>{updatingMessage}</span>
          </motion.div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => fetchRiders()}
              className="px-4 py-2 bg-color1 text-white rounded-md hover:bg-color1/80 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="text-center text-color1 p-4">Loading riders...</div>
        ) : (
          <div className="flex items-center justify-between flex-wrap">
            {/* Heading stays at the start */}
            <h1 className="md:block text-lg text-color1 font-semibold p-2">
              All Riders
            </h1>

            {/* Action Icons */}
            <div className="flex gap-x-4">
              {selection ? (
                <>
                  {" "}
                  <GiCancel
                    className="text-red bg-white font-extrabold text-2xl rounded-md hover:bg-opacity-80 hover:text-red/20"
                    onClick={() => handleActions("off")}
                  />
                  <MdOutlineSelectAll
                    className="text-color1 bg-white font-extrabold text-2xl rounded-md hover:bg-opacity-80 hover:text-color1/20"
                    onClick={() => handleSelectAll()}
                  />
                  <IoCheckmarkDoneCircleOutline
                    className="text-color1 bg-white font-extrabold text-2xl rounded-md hover:bg-opacity-80 hover:text-color1/20"
                    onClick={() => handleActions("execute")}
                  />
                </>
              ) : (
                <>
                  {/* Add refresh icon */}
                  <RefreshCw
                    className={`text-color1 bg-white font-extrabold text-xl rounded-md hover:bg-opacity-80 hover:text-color1/20 cursor-pointer ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                    onClick={handleRefresh}
                  />
                  <CiExport
                    className="text-color1 bg-white font-extrabold text-2xl rounded-md hover:bg-opacity-80 hover:text-color1/20"
                    onClick={() => exportAllRidersToCSV(ridersData)}
                  />
                  <IoMdDoneAll
                    className="text-color1 bg-white font-extrabold text-2xl rounded-md hover:bg-opacity-80 hover:text-color1/20"
                    onClick={() => {
                      setCurrentAction("activate");
                      setSelection(true);
                    }}
                  />
                  <MdDeleteForever
                    className="text-color1 bg-white font-extrabold text-2xl rounded-md hover:bg-opacity-80 hover:text-color1/20"
                    onClick={() => {
                      setCurrentAction("delete");
                      setSelection(true);
                    }}
                  />
                </>
              )}
              <span className="text-color1/50">Total: {ridersData.length}</span>
              <span className="flex items-center text-color1/50">
                Online:{" "}
                <span className="text-green-500 font-medium ml-1">
                  {onlineRidersCount}
                </span>
                <span className="w-2 h-2 bg-green-500 rounded-full ml-1 animate-pulse"></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {loading ? (
        <div className="text-center text-color1 p-4">Loading riders...</div>
      ) : (
        <div className="bg-white/50 p-4 rounded-md flex-1 m-4 mt-0 text-black/80">
          {/* HEADER ROW */}
          <div className="hidden md:grid grid-cols-8 gap-5 bg-white/5 text-black/50 font-semibold p-3 rounded-md">
            {selection ? (
              <span className="text-center">Select</span>
            ) : (
              <span className="text-center">S/N</span>
            )}
            <span className="text-center">Picture</span>
            <span className="text-center">Name</span>
            <span className="text-center">Gender</span>
            <span className="text-center">Email</span>
            <span className="text-center">Status</span>
            <span className="text-center">Vehicle</span>
            <span className="text-center">Details</span>
          </div>

          {/* DATA ROWS */}
          <div className="overflow-auto md:overflow-visible">
            {filteredRiders.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No results found for &quot;{searchInput}&quot;
              </div>
            ) : (
              filteredRiders.map((rider, index) => (
                <div
                  className="grid grid-cols-2 md:grid-cols-8 gap-5 items-center border-b border-gray-200 p-3"
                  key={rider._id}
                >
                  {selection ? (
                    <input
                      type="checkbox"
                      checked={checkedStates[index] || false}
                      onChange={(e) =>
                        handleCheckboxChange(index, e.target.checked)
                      }
                      className="px-4 w-5 h-5  accent-color1 text-center border-gray-500 rounded-full"
                    />
                  ) : (
                    <span className="text-center">{index + 1}</span>
                  )}
                  {/* PROFILE IMAGE */}
                  <div className="flex justify-center relative">
                    <Image
                      src={
                        transformImageUrl(rider.facial_picture_url) ||
                        "/placeholder.jpg"
                      }
                      alt={`${rider.firstname} ${rider.lastname}`}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                    {/* Online status indicator dot */}
                    <span
                      className={`absolute top-0 right-0 inline-block w-3 h-3 rounded-full border-2 border-white ${
                        rider.is_online ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </div>

                  {/* RIDER INFO */}
                  <span className="text-xs sm:text-sm md:text-base font-medium text-center flex items-center justify-center">
                    {rider.firstname} {rider.lastname}
                    {rider.branding &&
                      rider.branding.toLowerCase() === "yes" && (
                        <span className="inline-flex ml-3 items-center justify-center w-4 h-4 bg-color2 text-white text-[10px] font-bold rounded-full">
                          B
                        </span>
                      )}
                  </span>

                  <span className="text-xs sm:text-sm md:text-base text-center">
                    {rider.gender}
                  </span>

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs sm:text-sm md:text-base truncate text-center">
                      {rider.email}
                    </span>
                    {rider.phone && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${rider.phone}`, "_self");
                        }}
                        className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                        title={`Call ${rider.firstname} ${rider.lastname}`}
                      >
                        <Phone className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
                  </div>

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
          isOnline={selectedRider.is_online}
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
