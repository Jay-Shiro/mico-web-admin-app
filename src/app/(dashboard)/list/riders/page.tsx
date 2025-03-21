"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {ridersData} from "@/lib/data"
import {Eye} from "lucide-react"
import { ProfileModal } from "./ProfileModal";
import { Rider } from "./riderType"

const RidersListPage = () => {
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [filteredRiders, setFilteredRiders] = useState<Rider[]>(ridersData);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = ridersData.filter((rider) => 
        `${rider.firstname} ${rider.lastname} ${rider.email} ${rider.status} ${rider.homeaddressdetails}`.toLowerCase().includes(searchInput.toLowerCase())
      );
      setFilteredRiders(filtered);
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [searchInput]);

  // update the rider status
  const handleStatusToggle = (riderId: number, updatedStatus: string) => {
    setFilteredRiders((prevRiders) => prevRiders.map((rider) => 
    rider.id === riderId ? { ...rider, status: updatedStatus } : rider
      )
    );
  }


  return (
    <>
      {/*TOP*/}
      <div className="bg-white p-4 h-[173px] rounded-md flex flex-col m-4 mt-0 justify-between">
        <h1 className="text-2xl text-color1 font-semibold">Manage Riders</h1>
        <SearchInput input={searchInput} setInput={setSearchInput}/>
      </div>

      {/*BOTTOM*/}
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex justify-between">
          <h1 className="hidden md:block text-lg text-color1 font-semibold">All Riders</h1>
          <div className="flex items-center justify-end">
          </div>
        </div>
      </div>
      {/*PAGINATION*/}
      <div className="bg-white/50 p-4 rounded-md flex-1 m-4 mt-0 text-black/80">
      {/* HEADER ROW */}
      <div className="hidden md:flex rounded-md bg-white/5 text-black/50 font-semibold p-3">
        <span className="px-14 w-3/12">Full name</span>
        <span className="w-2/12">Gender</span>
        <span className="w-2/12">Email</span>
        <span className="w-2/12">Status</span>
        <span className="w-2/12">Address</span>
        <span className="w-1/12 text-center">Details</span>
      </div> 

      {/* SCROLLABLE MOBILE VIEW */}
      <div className="md:hidden bg-white/5  text-black/50 font-semibold p-3 rounded-md text-center">
      {filteredRiders.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No result found for &quot;{searchInput}&quot;
        </div>
      ): (
        "All Riders"
      )}
      </div>

      {/* DATA ROWS */}
      <div className="overflow-x-auto min-w-[800px]">
       {filteredRiders.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No results found for &quot;{searchInput}&quot;
        </div>
       ): (
        filteredRiders.map((rider) => (
          <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-6 border-b border-gray-200 p-3 items-center" key={rider.id}>

            {/* PROFILE IMAGE */}
            <Image src={rider.facial_photo_url} alt={`${rider.firstname} ${rider.lastname}`} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" width={40} height={40} />

          {/* RIDER INFO */}
            <span className="w-full md:w-2/12 text-xs sm:text-sm md:text-base font-medium">{rider.firstname} - {rider.lastname}</span>

            <span className="w-full md:w-1/12 text-xs sm:text-sm md:text-base">{rider.gender}</span>
            
            <span className="w-full md:w-2/12 text-xs sm:text-sm md:text-base truncate">{rider.email}</span>
            
            <span className={`w-20 px-3 py-1 text-xs font-semibold rounded-full text-center
            ${rider.status.toLowerCase() === "active" ? "bg-color2/20 text-color2/80" : "bg-gray-200 text-gray-400"}`}> {rider.status}</span>
            
            <span className="w-full md:w-3/12 text-xs sm:text-sm md:text-base truncate">{rider.homeaddressdetails}</span>

            {/* VIEW PROFILE */}
            <button className="w-auto md:w-1/12 flex items-center justify-center text-color1/60 hover:text-color1/70 transition duration-200" title={`View ${rider.firstname}'s profile`} onClick={() => setSelectedRider(rider)}>
            <Eye className="w-5 h-5"/>
            </button>
          </div>
        ))
       )}
      </div>
      </div>

      {/* VIEW PROFILE MODAL */}
      {selectedRider && (
        <ProfileModal rider={selectedRider}
        onClose={() => setSelectedRider(null)}
        onStatusToggle={handleStatusToggle} />
      )}
      <div>
      </div>
    </>
  );
};

interface SearchInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}

const SearchInput = ({ input, setInput }: SearchInputProps) => {
  return (
    <><div className="flex items-center border rounded-2xl bg-white p-2">
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
